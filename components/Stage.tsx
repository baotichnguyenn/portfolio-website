'use client';

import { useEffect, useRef } from 'react';
import { BusinessCard } from './BusinessCard';
import styles from './Stage.module.css';

/** The turn is held still at each end so the card has a moment to be read. */
const TURN_START = 0.08;
const TURN_END = 0.88;

/**
 * How hard the card chases the scroll position, as a fraction closed per
 * 60fps frame. Lower is heavier. This is the difference between motion that
 * feels driven and motion that feels dragged: a wheel moves in discrete
 * notches, and binding the rotation straight to it makes the card jump a
 * chunk of angle per notch. The follower turns that staircase into a curve.
 */
const CHASE = 0.14;
const FRAME = 1000 / 60;

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

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let target = 0;
    let current = 0;
    let frame = 0;
    let last = 0;
    let running = false;

    const write = (value: number) => stage.style.setProperty('--e', value.toFixed(4));

    const readTarget = () => {
      const rect = stage.getBoundingClientRect();
      const runway = rect.height - window.innerHeight;
      const p = runway > 0 ? clamp01(-rect.top / runway) : 0;
      stage.style.setProperty('--p', p.toFixed(4));
      target = easeInOut(clamp01((p - TURN_START) / (TURN_END - TURN_START)));
    };

    const tick = (now: number) => {
      const delta = target - current;

      // Close enough that another frame could not move a pixel. Stopping here
      // is what lets the compositor hint below be dropped while idle.
      if (Math.abs(delta) < 0.0004) {
        current = target;
        write(current);
        running = false;
        stage.dataset.turning = 'false';
        return;
      }

      // Frame-rate independent exponential approach, so a 120Hz display does
      // not chase twice as fast as a 60Hz one.
      const dt = last ? Math.min(now - last, 64) : FRAME;
      last = now;
      current += delta * (1 - Math.pow(1 - CHASE, dt / FRAME));
      write(current);
      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      readTarget();
      if (reduced) {
        current = target;
        write(current);
        return;
      }
      if (running) return;
      running = true;
      last = 0;
      stage.dataset.turning = 'true';
      frame = requestAnimationFrame(tick);
    };

    readTarget();
    current = target;
    write(current);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section ref={stageRef} className={styles.stage} data-turning="false">
      <div className={styles.sticky}>
        <div className={styles.entrance}>
          <div className={`${styles.perspective} ${pushed ? styles.pushed : ''}`}>
            <BusinessCard onOpenCareers={onOpenCareers} inert={pushed} />
          </div>
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
