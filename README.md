# Portfolio — business card prototype

The page *is* a business card — full bleed, edge to edge — in the register of the Paul Allen card
from *American Psycho*. Three states, one object:

1. **Front** — the card at rest, filling the viewport: name, title, `CAREERS`, contact strip.
2. **Back** — scroll down; the page hinges on its top edge, the bottom edge lifting toward you and
   sweeping up and over. It recedes into the void, turns 180° and settles back to full bleed. Its
   reverse is the projects grid, three per row.
3. **Careers** — click `CAREERS` (on either face); the page slides left and a drawer enters from the
   right with work history drawn as a tree.

## Run

```
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Making it yours

Everything you need to change is in [lib/content.ts](lib/content.ts) — name, title, contact,
six projects, and the career tree. No component holds copy.

Design rules and the motion spec are in [CLAUDE.md](CLAUDE.md). Read §4 before touching the
transforms: a viewport-sized plane turning toward the viewer both drifts and over-runs the frame,
and the CSS corrects each on purpose.

## Known prototype edges

- The grid is sized for exactly **6** projects; a seventh collapses the row heights.
- Mobile works but is the least-tuned path: the reverse scrolls internally below 620px.
- Project links are `#` placeholders.
