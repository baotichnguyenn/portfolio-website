# CLAUDE.md — Portfolio Website

Personal portfolio built around one conceit: **the page is a business card** — specifically Paul
Allen's, from *American Psycho* (Pierce & Pierce, Mergers and Acquisitions). Not a card sitting on a
page: the viewport itself is the stock, edge to edge, and the card face reproduces the reference
photo's grain, lettering and layout, measured rather than eyeballed. Restraint is the whole
aesthetic. Every decision defaults to *less*.

The reference is a straight-on photograph of the card, 987 × 627. Every number in §2 below came off
it with a script; when this file says "the photo", that is what it means.

---

## 1. The concept

Two sheets of the same stock, and a drawer.

| State | Trigger | What happens |
|---|---|---|
| **CARD** | page load, scroll top | The card fills the viewport, laid out as the reference: phone top left, `CAREERS` where "Pierce & Pierce" sits, name and title centred, two address lines along the bottom. A hairline of the projects sheet shows along the bottom edge. |
| **PULL** | scroll down | The projects sheet is pulled up from the bottom edge. In step with it the card tips about its top edge — its bottom edge lifting up and toward you, clockwise seen from the card's right — blurring and dimming until the sheet has covered it. |
| **PROJECTS** | pull complete | The sheet is now an ordinary page, three projects to a row, and scrolls on for as long as it is. |
| **CAREERS** | click `CAREERS` (on the card, or on the sheet) | The card slides left and recedes; a drawer enters from the right with work history drawn as a **tree**. |

There is no navigation, no router, and no scroll-jacking: the pull is native scrolling.

---

## 2. Design language

### Material
The page is **cotton stock**, and the grain is what says so. `public/paper/grain.png` is generated,
not drawn: `scripts/generate-paper.mjs` (`npm run paper`) builds tileable multi-octave noise and
solves for the octave amplitudes that reproduce the photo's grain — its luminance sd after box blurs
of 1, 3, 5, 9, 17 and 33px (14.8 → 1.6), its long dark tail (p2 −34, p98 +27), and its extremes
(p0.1 −53, p99.9 +37). Rendered, the paper matches the photo on every one of those within two levels.

The tile is **multiplied** over `--paper-base` (`background-blend-mode: multiply`). Multiply keeps
the grain proportional to the paper under it, and it only darkens — which is why `--paper-base` is
`--paper ÷ 0.85`: the light specks need that headroom. The tile's texels map to photo pixels, so it
is sized in card units (`--grain-size`), floored at 1:1 so it never goes sub-pixel on a phone.

**Letterpress** is `--press`: the ink sits below the surface, so the lower lip of each stroke catches
light and the upper lip sits in shadow. In `em`, so it scales with the lettering.

There is **no trim line and no border** on the card: the reference has none, and the grain carries
the "this is paper" job on its own. Depth appears only in motion — the card's blur and shade as it
tips, the sheen on its face, the shadow the projects sheet casts up onto it. Never a glow, a gradient
fill for its own sake, or a border-radius above 2px.

### Colour
All colour lives in `app/globals.css` as tokens. Never hard-code a hex in a component. The stock and
ink are the photo's, measured.

```
--paper        #D3CAC6   the stock's mean — the photo's blank paper, exactly
--paper-base   #F8EEE9   --paper ÷ 0.85: what the grain is multiplied over
--paper-edge   #B9B0AC   the cut edge, seen only when the drawer pushes the card aside
--ink          #332A2D   the photo's ink — a charcoal with an aubergine cast. 8.6:1
--ink-soft     #564B4E   captions, dates, stacks. 5.2:1
--rule         #9B918D   hairlines
--field        #0F0C0D   the void; seen only around the pushed card
--accent       #6E2A24   oxblood, 6.5:1. Hover, focus, and the org names in the drawer.
                         Never on the card face at rest — the reference is one ink.
```

**One palette in both colour schemes.** `color-scheme: light`, no dark variant. The card is the
card; the reference stock is already a mid-light warm grey (≈80% luminance), not bright bone, and
every dimmed version tried cost the ink contrast (8.6 → ~5) and the accent its AA margin. If a dark
mode is ever wanted, it is a new design decision, not a token swap — revisit this paragraph first.

### Type
**One family: Jost** (400, 500, 600 — nothing else is loaded, and an unloaded weight is silently
faked by the browser). The reference is set in a geometric sans; Jost is the nearest open match, and
the fallback stack names the paid originals (Futura PT, Futura).

- **Capitals, weight 600**, for everything on the card except the title. Tracking is tight, per the
  photo — between −0.015em and +0.07em, fitted per line (below), not a house value.
- **The title is the one sentence-case, regular-weight line on the card** ("Vice President").
- **Figures print at 0.86 of the capitals** in running lines — "358 EXCHANGE PLACE", "FAX 212…" —
  measured on the photo (19px figures against 22px capitals). `components/Figures.tsx` does it; use
  it anywhere digits sit among capitals (the drawer's periods, the sheet's years and count do).
- **An ampersand prints at 0.8** ("PIERCE & PIERCE"). `CardFront.tsx` handles it in the label.
- Off the card — sheet and drawer — the same family, capitals at 600 for headings and labels,
  sentence case at 400 for anything you read. Never italic. Never above 600.

### Layout (the card face)
**Every position on the card is the photo's**, as a fraction of the card, and **every size is the
photo's cap height** in card units: `--u` is 1% of the card's width, where the card is the viewport
but never wider than the photo's 1.574 aspect allows for its height. With `line-height: 1`, a Jost
line box's centre is its cap centre, so each element is placed with `top: <centre>%` and
`translate: 0 -50%`.

| Element | Cap centre (y) | Horizontal | Cap height → font-size | Tracking |
|---|---|---|---|---|
| phone | 14.83% | left 8.71% | 3.17u | −0.015em |
| label (`CAREERS`) | 13.24% | right 9.63% | 3.855u | −0.014em |
| sub-line | label + 3.748u | right-aligned | 2.17u | fitted (below) |
| name | 45.06% | centred | 4.35u | 0.07em |
| title | name + 5.11u | centred | 3.28u (400, sentence case) | 0 |
| address | 78.95%, then 1.488 leading | centred | 3.06u | −0.01em |

These were calibrated by rendering the photo's exact text on the site at 987 × 627 and measuring
both images with the same script: every element lands within 0–2px of the photo in position, width
and cap height. **Do not nudge them by eye** — if something looks off, re-measure. Jost's capitals
run 8–11% wider than the reference face at the same height, which is what the negative tracking is
buying back.

**The lockup is justified.** On the photo "MERGERS AND ACQUISITIONS" runs exactly the width of
"PIERCE & PIERCE" (289px each). CSS cannot fit tracking to a width, so `CardFront.tsx` measures the
label's glyphs and spreads the sub-line to match, re-fitting on resize and when the webfont lands.
Any label and sub-line text works.

On a portrait phone `--u` becomes `1.35vw` — the card cannot keep the photo's proportions and stay
legible — and the address lines may wrap (`text-wrap: balance`). The title is placed off the name in
`u` precisely so the pair stays together on a tall screen.

### Spacing
Off the card, `--gutter-x` / `--gutter-y` echo the card's ~9% margins, so the sheet and drawer feel
printed on the same stationery.

---

## 3. Motion

Motion is mechanical, not playful. Things are *pulled*, *tipped*, *slid* — never bounced.

- **Easing**: `cubic-bezier(.22,.61,.36,1)` for entrances and the drawer. The pull is linear —
  see below. No spring overshoot anywhere.
- **Durations**: 180ms (hover/state), 420ms (drawer), 760ms (entrance), scroll-driven (the pull —
  the reader owns the clock).
- **Only `transform`, `translate`, `scale`, `opacity` and `filter` change per frame.** Never width,
  height, top, left, or `box-shadow` — the sheet's cast shadow is an opacity-driven pseudo-element
  precisely so pulling repaints nothing.
- **`prefers-reduced-motion: reduce` is a first-class path**: the card does not tip or grow, and the
  sheet simply scrolls up over it — which is ordinary scrolling, not an animation, so there is nothing
  to cut or cross-fade. The card still dims beneath it. The entrance and the drawer slide are off.
  **Screenshot this mode.** No amount of scrolling in a normal browser will show it to you.

### The scroll mechanism
The stage is `200dvh − --peek` tall and pins the card for exactly one screen of scrolling. The
projects sheet is the next section in the document, pulled up by a `−100dvh` margin, so it starts
one `--peek` above the bottom of the viewport and reaches the top exactly as the stage runs out.
**The pull is native scrolling**: under the reader's hand, compositor-smooth, and the sheet carries
on as an ordinary page afterwards, holding any number of projects.

`Stage.tsx` is the only scroll listener. It publishes two numbers on the `.scene` wrapper — `--p`,
how far the sheet has been pulled (raw, linear), and `--e`, a damped follower of it — and **nothing
else**. Every angle, blur, scale and offset is a `calc()` off those two.

**`--e` is damped, not bound.** A wheel arrives in discrete notches, and binding the tip straight to
scroll makes the card jump a chunk of angle per notch. `--e` chases `--p` with a frame-rate
independent exponential follower (`CHASE`), and the loop stops itself once settled — which is what
lets `will-change` be scoped to `[data-turning='true']` rather than pinning a viewport-sized layer
for the life of the page.

**The sheet and the card move as one.** The card tips on `--e`, which lags a fast scroll, but the
sheet is native and would not. So the sheet is held back by exactly the lag —
`translate: 0 calc((--p − --e) × runway)` — which is zero at rest. Measured after a single hard jump
of the scroll position, the sheet sits within 0.4px of where the card's angle puts it on every
frame. **Never put a CSS `transition` on anything driven by `--e`**: two lags fight, and read as a pop.

The pull is **linear** in scroll, deliberately. It is under the reader's hand, and a pull that eases
in feels like it is resisting. The follower is the smoothing.

**The entrance** is a one-shot `settle` keyframe on `.entrance` — the card fades up from 1.6% above,
as if set down. It gets its own element and animates `translate`, not `transform`, so it never
competes with the tip on `.flipper` or the drawer push on `.perspective`. Two elements writing the
same property is how this kind of thing breaks silently.

---

## 4. The pull (read before touching the card's transforms)

The card tips about its **top** edge while the sheet comes up from below, and the one thing that
must never happen is the void showing between them. The geometry that guarantees it:

- The hinge is pinned to the top of the frame, so the card always covers from `y = 0` down to its
  (projected) lower edge — and since everything below the hinge tips *toward* the viewer, the card is
  never narrower than the frame either.
- The sheet always covers from its own top edge down.
- So there is no void as long as the card's projected lower edge stays below the sheet's top edge.
  Tipping lifts that edge; perspective magnifies it past the frame. At `perspective: 4200px` it
  holds for any tip up to about 80° — hence **`--turn: 80deg`**: the card has tipped that far by
  the time the sheet has covered it, and never goes edge-on.

The card is therefore **never re-centred and never turns over** — both were earlier designs. A full
180° turn in place goes edge-on at the midpoint and spends half the pull on a strip of card over a
black void. There is **no reverse face**; nothing would ever show it.

**The blur and its overscan.** The card recedes as the sheet covers it — `blur()` and `brightness()`
on `.perspective`, the card's parent, because a filter flattens 3D on the element it sits on. A blur
also samples past the card's edges, which would ring the frame with the void; `scale` grows the layer
6% over the pull, faster than the 14px blur spreads, so those soft edges stay off screen. It is the
independent `scale` property, so the drawer push still owns `transform`.

**`--turn`, the 4200px perspective, the 14px blur and the 6% overscan are one tuned set.** Change any
of them and re-run the void check (§7) — screenshots at a handful of angles will not catch a sliver
that only opens at 92% on one aspect ratio.

---

## 5. Architecture

```
app/
  layout.tsx          fonts (Jost 400/500/600), metadata, <html> shell
  page.tsx            composes Stage + CareerDrawer, owns `careersOpen`
  globals.css         tokens, card unit, grain, reset
components/
  Stage.tsx           the scene: pinned card + projects sheet. The only scroll listener.
  BusinessCard.tsx    the tipping plane: .flipper > .face > CardFront
  CardFront.tsx       the reference layout; fits the lockup's sub-line to the label
  ProjectsSheet.tsx   the second sheet: pulled up, then an ordinary page, 3 to a row
  CareerDrawer.tsx    right-hand drawer, focus trap, tree renderer
  Figures.tsx         digits among capitals print at 0.86
lib/
  content.ts          ALL copy and data. The only file a content edit touches.
scripts/
  generate-paper.mjs  fits and writes public/paper/grain.png (`npm run paper`)
public/paper/
  grain.png           generated — do not edit by hand
```

Rules:

- **Components hold no content.** Name, phone, address, projects, jobs — all in `lib/content.ts`.
- One CSS Module per component (`Foo.module.css`), tokens from `globals.css`. No CSS-in-JS, no Tailwind.
- Client components are marked `'use client'` and kept as few as possible.
- No state library. `careersOpen` is `useState` in `page.tsx`; scroll progress is a CSS variable.

### Content model

```ts
Identity    { phone, careersLabel, careersSub, name, title, address: [string, string] }
Project     { id, title, kind, year, blurb, stack[], href? }
CareerNode  { id, role, org, period, location?, summary?, highlights[], children?: CareerNode[] }
```

`Identity` maps one-to-one onto the reference card: `phone` is "212.555.6342", `careersLabel` /
`careersSub` are "PIERCE & PIERCE" / "MERGERS AND ACQUISITIONS", `name` / `title` are "PAUL ALLEN" /
"Vice President", and `address` is the two bottom lines. Keep the address lines roughly the photo's
lengths (about 38 and 30 characters) — the layout will hold longer, but the card stops looking like
the card.

The career tree renders recursively — `children` are nested engagements/teams, drawn with CSS elbow
connectors off a single trunk rule. Depth beyond 2 is allowed but discouraged.

**Projects are three to a row**, and the sheet scrolls, so there is no cap — but prefer multiples of
three; a row that ends short reads as unfinished.

---

## 6. Accessibility

Non-negotiable, because the whole site is one animated object:

- All content is in the DOM at all times and readable with CSS disabled. The tip and blur are
  presentation; they never gate content from assistive tech.
- `CAREERS` is a `<button>`, on the card and on the sheet. The drawer is `role="dialog"
  aria-modal="true"`, traps focus, closes on `Escape` and backdrop click, and returns focus to the
  button that opened it.
- The card and the sheet are `inert` while the drawer is open, so focus cannot wander behind it.
- Body scroll locks while the drawer is open.
- Every interactive element has a visible `:focus-visible` ring in `--accent`.
- Contrast, against `--paper`: `--ink` ≥ 7:1 (it is 8.6), `--ink-soft` and `--accent` ≥ 4.5:1.
  **Compute it, do not judge it by eye** — a dark accent once looked fine and measured 4.01:1. Check
  the worst dark speck of the grain too (≈ `#AAA29E`), not only the mean.
- Hit targets ≥ 44px even where the visual mark is a 1px rule.

---

## 7. Conventions

- TypeScript strict. No `any`. Content types exported from `lib/content.ts`.
- Named exports for components; default export only for Next's `page`/`layout`.
- Comments explain *why* (the hinge, the overscan, the measured numbers) — never *what*.
- `npm run dev` on :3000, `npm run build` must pass clean before anything is called done.
- **Verify visually, not just by build.** The pull is the product; a green build says nothing about
  it. Screenshot the card at rest, three or four points through the pull, the sheet after it — and
  the reduced-motion path.
- **Measure the void, do not eyeball it.** Step the pull from 0 to 100% and count on-screen pixels
  darker than the card can ever be (luminance < 22 — only `--field` gets there). It must be zero at
  every step, across viewports from 390px to 2560px wide. A sliver that opens at one angle on one
  aspect ratio is invisible in a screenshot of a different one.
- **Measure the card against the photo**, same script both sides, before and after touching §2's
  layout table: render the photo's own text at 987 × 627 and compare line positions and widths.
- Responsive: the card is always full bleed. Below 900px the projects drop to 2 per row, below 620px
  to 1, and the drawer goes near-full-width. The pull is unchanged.

## 8. Taste guardrails

Do not add: gradients on the card, a border or trim on the card, glassmorphism, emoji, a hero CTA
button, a scroll hint (the peek is the affordance), a testimonials section, a skills bar chart,
parallax on anything but the card, more than one accent colour, a second typeface, or a font weight
you cannot justify. If a change makes the page look like a SaaS landing page, it is wrong. If it
makes the card look less like the photo, it is also wrong.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
