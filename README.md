# Portfolio — business card prototype

The page *is* a business card — full bleed, edge to edge — reproducing Paul Allen's card from
*American Psycho*: its cotton-stock grain, its lettering and its layout, measured off a reference
photo rather than drawn by eye.

1. **Card** — the card at rest, filling the viewport: phone top left, `CAREERS` where
   "Pierce & Pierce" sits, name and title centred, two address lines along the bottom.
2. **Projects** — scroll down and a second sheet of the same stock is pulled up from the bottom
   edge. In step with it the card tips up and away about its top edge, blurring and dimming until
   the sheet has covered it. The sheet is then an ordinary page, three projects to a row.
3. **Careers** — click `CAREERS` (on the card or the sheet); the card slides left and a drawer enters
   from the right with work history drawn as a tree.

## Run

```
npm install
npm run dev      # http://localhost:3000
npm run build
npm run paper    # regenerate public/paper/grain.png from the fitted grain statistics
```

## Making it yours

Everything you need to change is in [lib/content.ts](lib/content.ts) — phone, name, title, the two
address lines, the Careers lockup, the projects, and the career tree. No component holds copy.

Design rules and the motion spec are in [CLAUDE.md](CLAUDE.md). Two sections matter most before
changing anything: §2 "Layout", which holds the card's measured positions and sizes, and §4, which
explains why the card tips 80° rather than turning over and what keeps the void from showing.

## Known prototype edges

- The typeface is Jost, the nearest open match to the reference's geometric sans. Licensing Futura
  PT or Brandon Grotesque would get closer; the fallback stack already names Futura.
- Project links are `#` placeholders.
- There is no dark mode, by decision — see CLAUDE.md §2 "Colour".
