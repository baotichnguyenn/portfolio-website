import type { Metadata } from 'next';
import { identity } from '@/lib/content';
import './globals.css';

export const metadata: Metadata = {
  title: `${identity.name} — ${identity.title}`,
  description: `Portfolio of ${identity.name}.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Loaded over the wire rather than at build time so the site still
            builds and degrades to the fallback stacks with no network. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
