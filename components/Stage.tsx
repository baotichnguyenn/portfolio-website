'use client';

import { useEffect, useRef } from 'react';
import { BusinessCard } from './BusinessCard';
import styles from './Stage.module.css';

/** The flip is held still at each end so the card has a moment to be read. */
const FLIP_START = 0.08;
const FLIP_END = 0.88;

/** Matches --ease-in-out. Kept in JS because CSS cannot ease a custom property. */
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

type Props = {
  pushed: boolean;
  onOpenCareers: () => void;
};

export function Stage({ pushed, onOpenCareers }: Props) {
  const stageRef = useRef<HTMLElement>(null);

  // The only scroll listener in the app. It publishes two numbers; every
  // transform, opacity and scale downstream is derived from them in CSS.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let frame = 0;

    const publish = () => {
      frame = 0;
      const rect = stage.getBoundingClientRect();
      const runway = rect.height - window.innerHeight;
      const p = runway > 0 ? clamp01(-rect.top / runway) : 0;
      const t = clamp01((p - FLIP_START) / (FLIP_END - FLIP_START));
      stage.style.setProperty('--p', p.toFixed(4));
      stage.style.setProperty('--e', easeInOut(t).toFixed(4));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(publish);
    };

    publish();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section ref={stageRef} className={styles.stage}>
      <div className={styles.sticky}>
        <div className={`${styles.perspective} ${pushed ? styles.pushed : ''}`}>
          <BusinessCard onOpenCareers={onOpenCareers} inert={pushed} />
        </div>
        <div
          className={`${styles.hint} ${pushed ? styles.hintHidden : ''}`}
          aria-hidden="true"
        >
          <span className={styles.hintRule} />
          Scroll
        </div>
      </div>
    </section>
  );
}
