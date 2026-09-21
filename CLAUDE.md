# CLAUDE.md — Portfolio Website

Personal portfolio built around one conceit: **the page is a business card**, in the register of the
American Psycho card scene (Paul Allen, Pierce & Pierce). Not a card sitting on a page — the viewport
itself is the stock, edge to edge. Restraint is the whole aesthetic. Every decision defaults to *less*.

---

## 1. The concept

Three states, one object. The card is never replaced — it turns over.

| State | Trigger | What happens |
|---|---|---|
| **FRONT** | page load, scroll top | The card fills the viewport: name, title, `CAREERS` where "Pierce & Pierce" sits, contact strip along the bottom. |
| **BACK** | scroll down | The page hinges on its **top edge** — the bottom edge lifts toward you and sweeps up and over, clockwise seen from the card's right. It recedes into the void, turns 180° and settles back to full bleed. Its reverse is **Projects** — a 3-per-row grid. |
| **CAREERS** | click `CAREERS` (on either face) | The page slides left and recedes; a drawer enters from the right with work history drawn as a **tree**. |

There is no navigation, no router, no scroll-jacking beyond the single sticky stage.

---

## 2. Design language

### Material
The page is **paper**, not a background colour. Two things carry that: the grain on `.face`, and the
**trim** — a hairline inset `--trim` from the viewport edge. Without the trim a full-bleed page reads
as a colour; with it, it reads as stock. Depth appears only when the page lifts off during the turn:
a long, low-opacity shadow, a 1px edge, and the **sheen** — a top-lit gradient on `.face::after`
whose opacity tracks `sin θ`, so the surface is flat at rest and catches light most as it goes
edge-on. That sheen is doing most of the work of making the turn read as a physical object; a plane
that rotates without shading is the clearest tell that something is a CSS transform. Never a glow,
a gradient fill for its own sake, or a border-radius above 2px.

### Colour
All colour lives in `app/globals.css` as tokens. Never hard-code a hex in a component.

```
--paper        #EDE8DB   the page (bone)
--paper-edge   #E2DBC9   the 1px edge that appears when the page lifts
--ink          #26241F   text (never #000 — ink soaks into fibre)
--ink-soft     #6B665A   secondary text, dates, captions
--rule         #C3BBA7   hairlines, the trim
--field        #0D0D09   the void the card turns over in
--accent       #6E2A24   oxblood. One use per screen, maximum.
```

**Dark mode inverts the stock**, not just the field: dark paper, light ink, `--accent` lifted to
`#C06C64` to hold contrast. This is the one place the design departs from the film — a full screen of
bone at night is not restraint, it is a torch. Every token is redefined under
`@media (prefers-color-scheme: dark)` and again under `:root[data-theme='dark']`.

### Type
Two families, no more.

- **Serif — `EB Garamond`** → the card faces. Everything uppercase, `letter-spacing` between
  `.14em` and `.5em`. Tracking *is* the design; when something looks wrong, it is almost always
  tracking, not size.
  - **One exception: `.statement`**, the sentence in the middle of the front. Sentence case, near-zero
    tracking, sized between the name and the title. It is there because the hierarchy otherwise falls
    from 106px straight to 14px with nothing between, which is most of why the page read as
    unfinished — and because uppercase at sentence length is unreadable. Keep it the only one.
- **Sans — `Inter`** → tile blurbs and the career drawer — content rather than card.

Every size is a `clamp()` against `vw`, because the card is the viewport and has to hold its
proportions from a phone to a 32" display. Never use font-weight above 500. Never use italic.

### Spacing
The card's margins are the page's margins: `--gutter-x` and `--gutter-y`, both fluid. Both faces use
the same pair, so the front and the reverse feel printed on one sheet.

---

## 3. Motion

Motion is mechanical, not playful. Things are *hinged*, *slid*, or *revealed* — never bounced.

- **Easing**: `cubic-bezier(.22,.61,.36,1)` for entrances, a cubic in-out for the turn. No spring
  overshoot anywhere.
- **Durations**: 180ms (hover/state), 420ms (drawer), scroll-driven (the turn — the user owns the clock).
- **Only `transform` and `opacity` animate.** Never width, height, top, or left.
- **`prefers-reduced-motion: reduce` is a first-class path**, not a fallback: the turn becomes a
  **cut** — the reverse swaps in over the front at half scroll — and the drawer becomes a fade. Not a
  cross-fade: fading both faces leaves a hole where the two ramps meet and the screen goes blank, and
  any overlap shows both faces at once. **Screenshot this mode too.** It is the one path no amount of
  scrolling in a normal browser will reveal.

Scroll progress comes from a tall `.stage` with a `position: sticky` inner. `Stage.tsx` publishes two
custom properties on it — `--p` (raw scroll through the stage) and `--e` (turn progress) — and
**nothing else.** Every rotation, scale and opacity downstream is a `calc()` off those two numbers;
JS never touches a transform.

**`--e` is damped, not bound.** Scroll position is the *target*; `--e` chases it with a frame-rate
independent exponential follower (`CHASE` in `Stage.tsx`). This is the single biggest difference
between motion that feels driven and motion that feels dragged: a wheel arrives in discrete ~100px
notches, and binding rotation straight to scroll makes the card jump a chunk of angle per notch, at
whatever noisy velocity the input device happens to have. Never reintroduce a CSS `transition` on a
value the follower already smooths — the two lags fight and read as a pop. The loop stops itself
once settled, which is also what lets `will-change` be scoped to `[data-turning='true']` instead of
pinning a compositor layer for a viewport-sized element for the life of the page.

Timeline: `0–.08` hold · `.08–.88` turn · `.88–1` settle. The reverse's content fades in only past
`--e` 0.52, once the page is coming back toward the viewer.

**The entrance** is a one-shot `settle` keyframe on `.entrance` — the page fades up from 1.6% above,
as if set down. It gets its own element and animates `translate` rather than `transform`, so it never
competes with the turn on `.lift` or the drawer push on `.perspective`. Two elements writing the same
property is how this kind of thing breaks silently.

---

## 4. The turn (read before touching card CSS)

A full-page plane rotating toward the viewer is the whole trick, and it has two problems the CSS
solves explicitly. Both live in `BusinessCard.module.css`.

**It drifts.** Rotating a rectangle 180° about its top edge lands it one full height *above* where it
started. The centre of a plane hinged on its top edge rises by `h/2·(1−cos θ)`, so `.lift` translates
down by exactly that, holding the page in the middle of the frame so it turns in place instead of
climbing out of view. **The sign of the rotation and the sign of this correction are a pair** —
reverse the turn and you must reverse the lift with it, or the page walks off screen.

**It over-runs the frame.** Tilt a viewport-sized plane toward a viewer and perspective makes its near
edge wider than the viewport, and `.sticky`'s `overflow: hidden` clips the corners. Two things buy
that back: a long perspective (4200px) and a recede, `--k = 1 − --turn-dip · sin θ`, peaking at
edge-on and returning to 1.

At the current perspective the plane is contained on its own, so **`--turn-dip` is now for weight,
not containment** — just enough to read as a sheet lifting off. Resist raising it. A big dip shrinks
the page into a flip-card widget and spends the middle of the animation on a small rectangle in a
black void, which is the opposite of grand. Let the sheen convey the rotation instead.

Two elements, because the two transforms need different origins: **`.lift`** dips and re-centres
about the middle, **`.flipper`** hinges on the top edge and rotates `+180deg` (a negative rotation
would bring the *top* edge toward the viewer instead — the opposite turn). `.perspective` sits above both so the 3D
chain stays intact; its distance (3400px) is tuned against `--turn-dip`. **Change one and you must
re-check the other** — screenshot the midpoint (`--e ≈ 0.4`) and confirm all four edges are inside
the frame.

Faces use `backface-visibility: hidden`; the back face is pre-rotated `rotateX(180deg)` to read upright.

---

## 5. Architecture

```
app/
  layout.tsx        fonts, metadata, <html> shell
  page.tsx          composes Stage + CareerDrawer, owns `careersOpen`
  globals.css       tokens, reset, base type
components/
  Stage.tsx         scroll → --p / --e. The only scroll listener in the app.
  BusinessCard.tsx  the 3D chain: .lift > .flipper > two faces
  CardFront.tsx     name / title / CAREERS slot / contact strip
  ProjectsGrid.tsx  the reverse: heading + 3-per-row tiles
  CareerDrawer.tsx  right-hand drawer, focus trap, tree renderer
lib/
  content.ts        ALL copy and data. The only file a content edit touches.
```

Rules:

- **Components hold no content.** Name, projects, jobs, contact — all of it in `lib/content.ts`.
- One CSS Module per component (`Foo.module.css`), tokens from `globals.css`. No CSS-in-JS, no Tailwind.
- Client components are marked `'use client'` and kept as few as possible.
- No state library. `careersOpen` is `useState` in `page.tsx`; scroll progress is a CSS variable.

### Content model

```ts
Identity    { name, title, statement, careersLabel, careersSub, contact[] }
Project     { id, title, kind, year, blurb, stack[], href? }
CareerNode  { id, role, org, period, location?, summary?, highlights[], children?: CareerNode[] }
```

The career tree renders recursively — `children` are nested engagements/teams, drawn with CSS elbow
connectors off a single trunk rule. Depth beyond 2 is allowed but discouraged.

**The projects grid holds 6 (2 rows × 3).** The rows stretch to fill the page, which is what keeps
each tile's meta line and stack locked to the top and bottom rules across a row. Add a 7th and the
row heights collapse; prefer curating down to 6.

---

## 6. Accessibility

Non-negotiable, because the whole site is one animated object:

- Both faces' content exists in the DOM at all times and is readable with CSS disabled. The turn is
  presentation; it never gates content from assistive tech.
- `CAREERS` is a `<button>`, on both faces. The drawer is `role="dialog" aria-modal="true"`, traps
  focus, closes on `Escape` and backdrop click, and returns focus to the button.
- The card is `inert` while the drawer is open, so focus cannot wander behind it.
- Body scroll locks while the drawer is open.
- Every interactive element has a visible `:focus-visible` ring in `--accent`.
- Contrast: `--ink` on `--paper` ≥ 12:1; `--ink-soft` and `--accent` ≥ 4.5:1. **Compute it, do not
  judge it by eye** — the dark accent looked fine and measured 4.01:1. Verify in **both** themes
  before changing any token; the dark palette is the one that fails, because a mid-tone that reads as
  restrained on bone loses its margin against dark stock.
- Hit targets ≥ 44px even where the visual mark is a 1px rule.

---

## 7. Conventions

- TypeScript strict. No `any`. Content types exported from `lib/content.ts`.
- Named exports for components; default export only for Next's `page`/`layout`.
- Comments explain *why* (the dip, the pivot maths) — never *what*.
- `npm run dev` on :3000, `npm run build` must pass clean before anything is called done.
- **Verify visually, not just by build.** The turn is the product; a green build says nothing about
  it. Screenshot front, midpoint and reverse after any change to the transforms — and the
  reduced-motion path, which normal scrolling will never show you.
- **Measure containment, do not eyeball it.** `getBoundingClientRect()` on `.flipper` returns the
  projected bounds of the 3D plane. Sweep `--e` from 0 to 1 and assert `left >= 0 && right <=
  innerWidth` at every step, across viewports from 390px to 2560px. A clipped corner at one angle on
  one aspect ratio is invisible in a screenshot of a different angle.
- Responsive: the page is always full bleed. Below 900px the grid drops to 2 columns, below 620px to
  1 with the reverse scrolling internally, and the drawer goes near-full-width. The turn is unchanged.

## 8. Taste guardrails

Do not add: gradients on the card, glassmorphism, emoji, a hero CTA button, a testimonials section,
a skills bar chart, parallax on anything but the card, more than one accent colour, or a font weight
you cannot justify. If a change makes the page look like a SaaS landing page, it is wrong.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
