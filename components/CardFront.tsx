'use client';

import { identity } from '@/lib/content';
import styles from './CardFront.module.css';

export function CardFront({ onOpenCareers }: { onOpenCareers: () => void }) {
  return (
    <div className={styles.front}>
      <header>
        <h1 className={styles.name}>{identity.name}</h1>
        <p className={styles.title}>{identity.title}</p>
      </header>

      {/* Where "Pierce & Pierce / Mergers and Acquisitions" sits on the card. */}
      <button
        type="button"
        className={styles.org}
        onClick={onOpenCareers}
        aria-haspopup="dialog"
      >
        <span className={styles.orgLabel}>{identity.careersLabel}</span>
        <span className={styles.orgSub}>{identity.careersSub}</span>
      </button>

      <address className={styles.contact}>
        {identity.contact.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </address>
    </div>
  );
}
