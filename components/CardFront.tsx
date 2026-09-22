'use client';

import { useLayoutEffect, useRef } from 'react';
import { identity } from '@/lib/content';
import { Figures } from './Figures';
import styles from './CardFront.module.css';

/** "PIERCE & PIERCE": the ampersand prints smaller than the capitals. */
function Ampersand({ text }: { text: string }) {
  const parts = text.split('&');
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <span className={styles.amp}>&amp;</span>}
          {part}
        </span>
      ))}
    </>
  );
}

export function CardFront({ onOpenCareers }: { onOpenCareers: () => void }) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);

  // On the reference, "MERGERS AND ACQUISITIONS" runs exactly the width of
  // "PIERCE & PIERCE" — 289px each, measured. CSS cannot fit tracking to a
  // width, so measure the label and spread the sub-line to meet it. Re-fits
  // whenever the label changes size: viewport, or the webfont arriving late.
  useLayoutEffect(() => {
    const label = labelRef.current;
    const sub = subRef.current;
    if (!label || !sub) return;

    const fit = () => {
      sub.style.letterSpacing = '0px';
      sub.style.marginRight = '0px';
      const labelTrail = parseFloat(getComputedStyle(label).letterSpacing) || 0;
      const target = label.getBoundingClientRect().width - labelTrail;
      const natural = sub.getBoundingClientRect().width;
      const gaps = Math.max((sub.textContent ?? '').length - 1, 1);
      const size = parseFloat(getComputedStyle(sub).fontSize);
      const spacing = Math.min(Math.max((target - natural) / gaps, -0.04 * size), 0.6 * size);
      sub.style.letterSpacing = `${spacing}px`;
      // Tracking also trails the last glyph; pull it back so the right edges meet.
      sub.style.marginRight = `${-spacing}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(label);
    document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.front}>
      <h1 className={styles.name}>{identity.name}</h1>
      <p className={styles.title}>{identity.title}</p>

      {/* Where "PIERCE & PIERCE / MERGERS AND ACQUISITIONS" sits on the card. */}
      <button
        type="button"
        className={styles.lockup}
        onClick={onOpenCareers}
        aria-haspopup="dialog"
      >
        <span ref={labelRef} className={styles.label}>
          <Ampersand text={identity.careersLabel} />
        </span>
        <span ref={subRef} className={styles.sub}>
          {identity.careersSub}
        </span>
      </button>

      <p className={styles.phone}>{identity.phone}</p>

      <address className={styles.address}>
        {identity.address.map((line) => (
          <span key={line} className={styles.line}>
            <Figures>{line}</Figures>
          </span>
        ))}
      </address>
    </div>
  );
}
