/**
 * Every word on this site lives here. Components render shapes, not copy.
 * Swap the placeholders below and the whole site becomes yours.
 */

/**
 * The card face, element for element, in the positions of the reference card
 * (Paul Allen's, Pierce & Pierce). See CLAUDE.md §2 "Layout" for where each
 * one sits.
 */
export type Identity = {
  /** Top left — "212.555.6342" on the reference. */
  phone: string;
  /**
   * Top right, where "PIERCE & PIERCE" sits. This is the Careers trigger. An
   * "&" in it prints smaller, as on the card.
   */
  careersLabel: string;
  /**
   * Under the label — "MERGERS AND ACQUISITIONS". It is spread to exactly the
   * label's width, so any length works, but a line with a word gap or two
   * reads best.
   */
  careersSub: string;
  /** Centred, in capitals. */
  name: string;
  /** Under the name, in sentence case — "Vice President" on the reference. */
  title: string;
  /**
   * The two centred lines along the bottom — "358 EXCHANGE PLACE…" and
   * "FAX … TELEX …". Figures print smaller than the capitals around them.
   */
  address: [string, string];
};

export type Project = {
  id: string;
  title: string;
  kind: string;
  year: string;
  blurb: string;
  stack: string[];
  href?: string;
};

export type CareerNode = {
  id: string;
  role: string;
  org: string;
  period: string;
  location?: string;
  summary?: string;
  highlights?: string[];
  /** Nested engagements, teams or notable stints inside a role. */
  children?: CareerNode[];
};

// ---------------------------------------------------------------------------
// PLACEHOLDER CONTENT — replace
// ---------------------------------------------------------------------------

export const identity: Identity = {
  phone: '024.555.0142',
  careersLabel: 'Careers',
  careersSub: 'Selected Experience',
  name: 'Your Name',
  title: 'Software Engineer',
  address: ['358 Exchange Place Hanoi Vietnam 10000', 'Email you@example.com'],
};

/**
 * Three to a row. The projects sheet scrolls, so there is no fixed count —
 * but a row that ends one short reads as unfinished; multiples of three.
 */
export const projects: Project[] = [
  {
    id: 'p1',
    title: 'Ledger',
    kind: 'Web Application',
    year: '2026',
    blurb:
      'Double-entry bookkeeping for people who hate bookkeeping. A year of statements, reconciled in a minute.',
    stack: ['TypeScript', 'Postgres', 'Rust'],
    href: '#',
  },
  {
    id: 'p2',
    title: 'Halftone',
    kind: 'Image Pipeline',
    year: '2025',
    blurb:
      'A GPU dithering service turning photographs into print-ready screens at 4k, sixty frames a second.',
    stack: ['WebGPU', 'Go', 'S3'],
    href: '#',
  },
  {
    id: 'p3',
    title: 'Quarry',
    kind: 'Developer Tool',
    year: '2025',
    blurb:
      'Static analysis that reads a monorepo and answers "what breaks if I delete this?" in plain English.',
    stack: ['Rust', 'tree-sitter', 'CLI'],
    href: '#',
  },
  {
    id: 'p4',
    title: 'Nocturne',
    kind: 'Mobile App',
    year: '2024',
    blurb:
      'Sleep tracking without a wearable. Audio is classified on device; nothing ever leaves the phone.',
    stack: ['Swift', 'CoreML', 'SQLite'],
    href: '#',
  },
  {
    id: 'p5',
    title: 'Strata',
    kind: 'Data Platform',
    year: '2024',
    blurb:
      'Survey data unified across four incompatible formats, queryable by anyone who can read a map.',
    stack: ['Python', 'DuckDB', 'Mapbox'],
    href: '#',
  },
  {
    id: 'p6',
    title: 'Ember',
    kind: 'Open Source',
    year: '2023',
    blurb:
      'A 4kb state container with no reducers, no providers, no opinions. Quietly used in production.',
    stack: ['TypeScript', 'Zero deps'],
    href: '#',
  },
];

/**
 * A forest, rendered as a tree: top-level entries are roles, `children` are the
 * engagements or teams inside them. Newest first.
 */
export const career: CareerNode[] = [
  {
    id: 'c1',
    role: 'Senior Software Engineer',
    org: 'Acme Systems',
    period: '2024 — Present',
    location: 'Hanoi',
    summary:
      'Platform group. Own the ingestion path from edge collectors through to the query layer.',
    highlights: [
      'Cut p99 ingest latency from 1.8s to 140ms by replacing the batch writer.',
      'Led the migration of 40 services off the legacy auth gateway.',
    ],
    children: [
      {
        id: 'c1a',
        role: 'Tech Lead',
        org: 'Ingestion Team',
        period: '2025 — Present',
        summary: 'Four engineers. Roadmap, review, and the on-call rotation.',
      },
      {
        id: 'c1b',
        role: 'Engineer',
        org: 'Query Layer',
        period: '2024 — 2025',
        summary: 'Built the columnar cache that now fronts every dashboard read.',
      },
    ],
  },
  {
    id: 'c2',
    role: 'Software Engineer',
    org: 'Northwind Labs',
    period: '2021 — 2024',
    location: 'Remote',
    summary:
      'Second engineering hire. Shipped the product that took the company from pilot to Series A.',
    highlights: [
      'Designed and built the billing system end to end.',
      'Interviewed and onboarded the first eight engineers.',
    ],
    children: [
      {
        id: 'c2a',
        role: 'Founding Engineer',
        org: 'Core Product',
        period: '2021 — 2022',
        summary: 'Zero to first paying customer in seven months.',
      },
    ],
  },
  {
    id: 'c3',
    role: 'Junior Developer',
    org: 'Pierce & Pierce',
    period: '2019 — 2021',
    location: 'New York',
    summary: 'Internal tooling for the mergers and acquisitions desk.',
    highlights: ['Automated a reporting process that occupied two analysts full time.'],
  },
];
