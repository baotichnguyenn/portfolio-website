# CLAUDE.md — Portfolio Website

Personal portfolio built around one conceit: **the site *is* a business card**, in the register of the
American Psycho card scene (Paul Allen, Pierce & Pierce). Restraint is the whole aesthetic. Every
decision defaults to *less*.

---

## 1. The concept

Three states, one object. The card is never replaced — it transforms.

| State | Trigger | What happens |
|---|---|---|
| **FRONT** | page load, scroll top | The card: name, title, `CAREERS` where "Pierce & Pierce" sits, contact strip. Small, centred, precious. |
| **BACK** | scroll down | Card pivots on its **bottom edge**, rotates 180° and scales up to a full panel. The reverse face is **Projects** — a 3-per-row grid. |
| **CAREERS** | click `CAREERS` on the card | Card slides left and recedes; a drawer enters from the right with work history drawn as a **tree**. |

There is no page navigation, no router, no scroll-jacking beyond the single sticky stage.

---

## 2. Design language

### Material
The card is **paper**, not a rectangle. Bone stock, letterpress ink, a hairline rule, the faintest
grain. Depth comes from a long, low-opacity shadow — never from a glow, gradient fill, or border-radius
above 2px.

### Colour
All colour lives in `app/globals.css` as tokens. Never hard-code a hex in a component.

```
--paper        #EDE8DB   card stock (bone)
--paper-edge   #E2DBC9   the 1px bevel that sells the emboss
--ink          #26241F   text (never #000 — ink soaks into fibre)
--ink-soft     #6B665A   secondary text, dates, captions
--rule         #C3BBA7   hairlines
--field        #17160F   the void behind the card
--accent       #6E2A24   oxblood. One use per screen, maximum.
```
Dark mode inverts the *field*, not the card — paper stays paper, it just dims (`--paper` → #D8D2C4).
Every token is redefined under `@media (prefers-color-scheme: dark)` and under `:root[data-theme]`.

### Type
Two families, no more.

- **Serif — `EB Garamond`** → the card itself. Everything uppercase, `letter-spacing` between
  `.14em` and `.34em`. Tracking *is* the design; when something looks wrong, it is almost always
  tracking, not size.
- **Sans — `Inter`** → project tiles, career drawer, anything that is content rather than card.

Scale is authored at **panel size** (see §4) and uniformly scaled down for the card state.
Never use font-weight above 500. Never use italic.

### Spacing
8px base. Card interior padding is a proportion of card width (`em`-based), so the card survives
scaling without its margins drifting.

---

## 3. Motion

Motion is mechanical, not playful. Things are *hinged*, *slid*, or *revealed* — never bounced.

- **Easing**: `cubic-bezier(.22,.61,.36,1)` for entrances, `cubic-bezier(.4,0,.2,1)` for the flip.
  No spring overshoot anywhere.
- **Durations**: 180ms (hover/state), 420ms (drawer), scroll-driven (flip — the user owns the clock).
- **Only `transform` and `opacity` animate.** Never width, height, top, or left. The flip scales the
  card rather than resizing it, precisely so no frame reflows.
- **`prefers-reduced-motion: reduce` is a first-class path**, not a fallback: the flip becomes a
  cross-fade at 50% scroll, the drawer becomes a fade. Ship it working in both modes.

### The flip, exactly
`transform-origin: center bottom` + `rotateX(0 → -180deg)`. Rotating a rectangle 180° about its own
bottom edge returns it to the *same footprint*, mirrored — so the layout never jumps. Faces use
`backface-visibility: hidden`; the back face is pre-rotated `rotateX(180deg)` to read upright.

Scroll progress comes from a tall `.stage` with a `position: sticky` inner. `Stage.tsx` publishes two
custom properties on it — `--p` (raw scroll through the stage) and `--e` (eased flip progress) — and
**nothing else.** Every rotation, scale and opacity downstream is a `calc()` off those two numbers;
JS never touches a transform.
Timeline: `0–.08` hold · `.08–.88` rotate + scale · `.88–1` settle.

---

## 4. The scale trick (read before touching card CSS)

The card and the projects panel are **the same element at the same authored size**. The card is
authored once at panel width (`--panel-w: min(900px, 88vw)`) and the *wrapper* is scaled:

```
--k: 0.46 → 1.0
```

At `p = 0` the whole card renders at 46% — which is what makes it read as a business card, with its
proportions and tracking perfectly preserved. So: **author every card measurement as if the card were
900px wide.** A 40px name is an 18px name on screen at rest. This is the single most confusing thing
in the codebase; do not "fix" it by shrinking the type.

The consequence to keep straight: **the front is authored ~2.2× larger than it renders; the back is
authored 1:1**, because the back is only ever seen at `p = 1`. That is why `CardFront.module.css` and
`ProjectsGrid.module.css` use very different `em` values for type that looks the same size on screen.

---

## 5. Architecture

```
app/
  layout.tsx        fonts, metadata, <html> shell
  page.tsx          composes Stage + CareerDrawer, owns `careersOpen`
  globals.css       tokens, reset, base type
components/
  Stage.tsx         scroll → --p / --e. The only scroll listener in the app.
  BusinessCard.tsx  the 3D box; renders CardFront + CardBack
  CardFront.tsx     name / title / CAREERS slot / contact strip
  ProjectsGrid.tsx  the back face: heading + 3-per-row tiles
  CareerDrawer.tsx  right-hand drawer, focus trap, tree renderer
lib/
  content.ts        ALL copy and data. The only file a content edit touches.
```

Rules:
- **Components hold no content.** Name, projects, jobs, contact — all of it in `lib/content.ts`.
- One CSS Module per component (`Foo.module.css`), tokens from `globals.css`. No CSS-in-JS, no Tailwind.
- Client components are marked `'use client'` and kept as few as possible: `Stage`, `CareerDrawer`,
  and the `CAREERS` button. Tiles and text stay server components.
- No state library. `careersOpen` is `useState` in `page.tsx`; scroll progress is a CSS variable.

### Content model
```ts
Project     { id, title, kind, year, blurb, stack[], href? }
CareerNode  { id, role, org, period, location?, summary?, highlights[], children?: CareerNode[] }
```
The career tree renders recursively — `children` are nested engagements/teams, drawn with CSS elbow
connectors off a single trunk rule. Depth beyond 2 is allowed but discouraged.

**The projects grid holds 6 (2 rows × 3).** It is sized to fit the flipped panel without nested
scrolling. Add a 7th and the panel scrolls internally — acceptable, but prefer curating down to 6.

---

## 6. Accessibility

Non-negotiable, because the whole site is one animated object:

- The card's content exists in the DOM at all times and is readable with CSS disabled. The flip is
  presentation; it never gates content from assistive tech.
- `CAREERS` is a `<button>`. The drawer is `role="dialog" aria-modal="true"`, traps focus, closes on
  `Escape` and backdrop click, and returns focus to the button.
- Body scroll locks while the drawer is open.
- Every interactive element has a visible `:focus-visible` ring in `--accent`.
- Contrast: `--ink` on `--paper` ≥ 12:1; `--ink-soft` ≥ 4.5:1. Verify before changing any token.
- Hit targets ≥ 44px even where the visual mark is a 1px rule.

---

## 7. Conventions

- TypeScript strict. No `any`. Content types exported from `lib/content.ts`.
- Named exports for components; default export only for Next's `page`/`layout`.
- Comments explain *why* (the scale trick, the pivot maths) — never *what*.
- `npm run dev` on :3000, `npm run build` must pass clean before anything is called done.
- Responsive: below 720px the card sits at `--k: 1` in a single column, the grid becomes 1-per-row,
  and the drawer becomes full-width. The flip still happens; only the scale ratio changes.

## 8. Taste guardrails

Do not add: gradients on the card, glassmorphism, emoji, a hero CTA button, a testimonials section,
a skills bar chart, parallax on anything but the card, more than one accent colour, or a font weight
you cannot justify. If a change makes the card look like a SaaS landing page, it is wrong.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
