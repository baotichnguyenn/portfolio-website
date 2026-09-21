# Portfolio — business card prototype

A portfolio site built as a single business card, in the register of the Paul Allen card from
*American Psycho*. Three states, one object:

1. **Front** — the card at rest: name, title, `CAREERS`, contact strip.
2. **Back** — scroll down; the card hinges on its bottom edge, turns 180° and scales up. Its reverse
   is the projects grid, three per row.
3. **Careers** — click `CAREERS` (on either face); the card slides left and a drawer enters from the
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

Design rules, the motion spec, and the one non-obvious trick in the CSS (the card is authored at
panel size and scaled *down* for the front state) are in [CLAUDE.md](CLAUDE.md). Read §4 before
touching `CardFront.module.css`.

## Known prototype edges

- The grid is sized for exactly **6** projects; a seventh makes the panel scroll internally.
- Mobile (<720px) works but is the least-tuned path: one project per row inside a scrolling panel.
- Project links are `#` placeholders.
