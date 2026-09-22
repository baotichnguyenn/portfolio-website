/**
 * Generates public/paper/grain.png — the cotton-stock texture every paper
 * surface on the site is printed on.
 *
 * The texture is fitted, not designed. TARGET_SD below is the luminance
 * standard deviation of the reference card photo's blank paper after box
 * blurs of increasing size, which says how much of the grain lives at each
 * feature scale. The script builds tileable value noise at several octaves,
 * solves for the octave amplitudes that reproduce that profile, adds the
 * photo's longer dark tail, and writes a grayscale tile meant to be
 * MULTIPLIED over a base colour (background-blend-mode: multiply). Multiply
 * keeps the grain proportional to the paper, so a darker theme dims the
 * grain with it instead of turning it into white speckle.
 *
 *   npm run paper
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const SIZE = 384; // tile edge in texels; every octave period must divide it
const PERIODS = [1, 2, 4, 8, 16, 32, 64];
const BLURS = [0, 1, 2, 4, 8, 16]; // box radii → 1, 3, 5, 9, 17, 33 px windows

// Measured on the reference photo, blank paper, 8-bit luminance units.
const TARGET_MEAN = 204;
const TARGET_SD = [14.84, 8.44, 5.95, 3.96, 2.54, 1.6];
const TARGET_P02 = -34; // the dark tail is longer than the light one
const TARGET_P98 = 27;
const TARGET_P001 = -53; // nothing on the photo's paper is darker or lighter
const TARGET_P999 = 37; //  than these; the fitted tail otherwise overshoots

// The tile is multiplied over a base colour this much lighter than the mean,
// which is the headroom the light specks need (multiply can only darken).
// Keep in step with --paper-base in app/globals.css.
const TEXEL_MEAN = 0.85;

// ---------------------------------------------------------------------------

function prng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand) {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Tileable value noise at one period, normalised to zero mean, unit sd. */
function octave(period, rand) {
  const cells = SIZE / period;
  const lattice = Float64Array.from({ length: cells * cells }, () => gaussian(rand));
  const at = (i, j) => lattice[((j + cells) % cells) * cells + ((i + cells) % cells)];
  const smooth = (t) => t * t * (3 - 2 * t);
  const out = new Float64Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (period === 1) {
        out[y * SIZE + x] = at(x, y);
        continue;
      }
      const gx = x / period;
      const gy = y / period;
      const i = Math.floor(gx);
      const j = Math.floor(gy);
      const tx = smooth(gx - i);
      const ty = smooth(gy - j);
      const top = at(i, j) * (1 - tx) + at(i + 1, j) * tx;
      const bottom = at(i, j + 1) * (1 - tx) + at(i + 1, j + 1) * tx;
      out[y * SIZE + x] = top * (1 - ty) + bottom * ty;
    }
  }
  return normalise(out);
}

function mean(field) {
  let m = 0;
  for (const v of field) m += v;
  return m / field.length;
}

function sd(field) {
  const m = mean(field);
  let s = 0;
  for (const v of field) s += (v - m) ** 2;
  return Math.sqrt(s / field.length);
}

function normalise(field) {
  const m = mean(field);
  const s = sd(field);
  return field.map((v) => (v - m) / s);
}

/** sd after a (2r+1)² box blur, wrapping at the tile edge like the tile will. */
function blurredSd(field, r) {
  if (r === 0) return sd(field);
  const n = SIZE;
  const w = 2 * r + 1;
  const tmp = new Float64Array(n * n);
  const out = new Float64Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let s = 0;
      for (let d = -r; d <= r; d++) s += field[y * n + ((x + d + n) % n)];
      tmp[y * n + x] = s / w;
    }
  }
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let s = 0;
      for (let d = -r; d <= r; d++) s += tmp[((y + d + n) % n) * n + x];
      out[y * n + x] = s / w;
    }
  }
  return sd(out);
}

function percentile(field, q) {
  const sorted = Float64Array.from(field).sort();
  return sorted[Math.floor(sorted.length * q)];
}

// 1. Octaves, and how much of each survives each blur.
const rand = prng(0x5eed);
const octaves = PERIODS.map((p) => octave(p, rand));
const gain = octaves.map((o) => BLURS.map((r) => blurredSd(o, r) ** 2));

// 2. Non-negative least squares for the octave variances. Relative error, so
//    the small large-scale targets count as much as the big fine-scale one.
const w = PERIODS.map(() => 10);
for (let iter = 0; iter < 20000; iter++) {
  for (let i = 0; i < w.length; i++) {
    let num = 0;
    let den = 0;
    BLURS.forEach((_, k) => {
      const t2 = TARGET_SD[k] ** 2;
      const rest = w.reduce((a, wj, j) => (j === i ? a : a + wj * gain[j][k]), 0);
      num += (gain[i][k] * (t2 - rest)) / (t2 * t2);
      den += gain[i][k] ** 2 / (t2 * t2);
    });
    w[i] = Math.max(0, num / den);
  }
}
const amp = w.map(Math.sqrt);

// 3. Combine, then bend the distribution so the dark tail is longer, as it is
//    on real cotton stock: fibre shadows and inclusions, not bright flecks.
let field = new Float64Array(SIZE * SIZE);
octaves.forEach((o, i) => {
  for (let k = 0; k < field.length; k++) field[k] += amp[i] * o[k];
});
const unit = normalise(field);
let best = { k: 0, err: Infinity };
for (let k = 0; k <= 0.5; k += 0.005) {
  const bent = normalise(unit.map((v) => (v < 0 ? v - k * v * v : v))).map((v) => v * TARGET_SD[0]);
  const err = (percentile(bent, 0.02) - TARGET_P02) ** 2 + (percentile(bent, 0.98) - TARGET_P98) ** 2;
  if (err < best.err) best = { k, err };
}
field = normalise(unit.map((v) => (v < 0 ? v - best.k * v * v : v)))
  .map((v) => v * TARGET_SD[0])
  .map((v) => Math.min(TARGET_P999, Math.max(TARGET_P001, v)));

// 4. Report the fit against the photo.
console.log('octave amplitudes ', PERIODS.map((p, i) => `${p}px:${amp[i].toFixed(2)}`).join('  '));
console.log('window  target   got');
BLURS.forEach((r, k) => {
  console.log(`${String(2 * r + 1).padStart(4)}px ${TARGET_SD[k].toFixed(2).padStart(7)} ${blurredSd(field, r).toFixed(2).padStart(6)}`);
});
console.log(
  `p2/p98  target ${TARGET_P02}/${TARGET_P98}   got ${percentile(field, 0.02).toFixed(1)}/${percentile(field, 0.98).toFixed(1)}   (tail bend ${best.k.toFixed(3)})`,
);

// 5. Encode as multiplier texels: texel = (mean + deviation) / base, where the
//    base is chosen so the average texel is TEXEL_MEAN.
const baseL = TARGET_MEAN / TEXEL_MEAN;
const pixels = Buffer.alloc(SIZE * SIZE);
let clipped = 0;
for (let k = 0; k < field.length; k++) {
  const t = (TARGET_MEAN + field[k]) / baseL;
  if (t > 1) clipped++;
  pixels[k] = Math.round(Math.min(1, Math.max(0, t)) * 255);
}
console.log(`texels clipped at white: ${((100 * clipped) / field.length).toFixed(2)}%`);

writePng(path.join('public', 'paper', 'grain.png'), SIZE, SIZE, pixels);

// ---------------------------------------------------------------------------

function writePng(file, width, height, gray) {
  const table = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = table[(c ^ b) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, sum]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // grayscale
  const raw = Buffer.alloc(height * (width + 1));
  for (let y = 0; y < height; y++) gray.copy(raw, y * (width + 1) + 1, y * width, (y + 1) * width);
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png);
  console.log(`wrote ${file} (${(png.length / 1024).toFixed(0)} KB)`);
}
