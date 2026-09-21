/**
 * Every word on this site lives here. Components render shapes, not copy.
 * Swap the placeholders below and the whole site becomes yours.
 */

export type Identity = {
  name: string;
  title: string;
  /**
   * The one sentence in the middle of the card. Sentence case, not uppercase —
   * it is the only element on either face that is, deliberately. Keep it under
   * ~120 characters or it stops being a statement and becomes a paragraph.
   */
  statement: string;
  /** Sits where "PIERCE & PIERCE" does on the Paul Allen card. This is the Careers trigger. */
  careersLabel: string;
  careersSub: string;
  /** The tiny letterspaced strip along the bottom edge of the card. */
  contact: string[];
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
  name: 'Your Name',
  title: 'Software Engineer',
  statement:
    'I build systems that hold up under load — ingestion paths, query layers, and the unglamorous middle of the stack.',
  careersLabel: 'Careers',
  careersSub: 'Selected Experience',
  contact: [
    '358 Exchange Place',
    'Hanoi, VN',
    'you@example.com',
    '+84 000 000 000',
  ],
};

/**
 * Six tiles — two rows of three. That is what fits the flipped panel without a
 * nested scrollbar. Curate rather than append. (See CLAUDE.md §5.)
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
