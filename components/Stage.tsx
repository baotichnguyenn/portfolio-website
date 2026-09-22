'use client';

import { useEffect, useRef } from 'react';
import { BusinessCard } from './BusinessCard';
import { ProjectsSheet } from './ProjectsSheet';
import styles from './Stage.module.css';

/**
 * How hard the turn chases the scroll position, as a fraction closed per 60fps
 * frame. Lower is heavier. A wheel moves in discrete notches, and binding the
 * rotation straight to it makes the card jump a chunk of angle per notch; the
 * follower turns that staircase into a curve.
 */
const CHASE = 0.14;
const FRAME = 1000 / 60;

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

type Props = {
  pushed: boolean;
  onOpenCareers: () => void;
};

/**
 * The card is pinned for exactly one screen of scrolling while the projects
 * sheet — an ordinary section, next in the document — scrolls up over it. That
 * one screen is the pull. --p is how far the sheet has come (raw), --e is the
 * damped follower of it; the card turns on --e, and the sheet is held back by
 * the difference between them, so the page and the card move as one.
 */
export function Stage({ pushed, onOpenCareers }: Props) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);

  // The only scroll listener in the app. It publishes two numbers; every
  // transform, filter and offset downstream is derived from them in CSS.
  useEffect(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    if (!scene || !stage) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let target = 0;
    let current = 0;
    let frame = 0;
    let last = 0;
    let running = false;

    const write = (value: number) => scene.style.setProperty('--e', value.toFixed(4));

    const readTarget = () => {
      const rect = stage.getBoundingClientRect();
      const runway = rect.height - window.innerHeight;
      // Linear, deliberately: the sheet is under the reader's hand, and a pull
      // that eases in feels like it is resisting. The follower is the smoothing.
      target = runway > 0 ? clamp01(-rect.top / runway) : 0;
      scene.style.setProperty('--p', target.toFixed(4));
    };

    const tick = (now: number) => {
      const delta = target - current;

      // Close enough that another frame could not move a pixel. Stopping here
      // is what lets the compositor hints be dropped while idle.
      if (Math.abs(delta) < 0.0004) {
        current = target;
        write(current);
        running = false;
        scene.dataset.turning = 'false';
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
      scene.dataset.turning = 'true';
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
    <div ref={sceneRef} className={styles.scene} data-turning="false">
      <section ref={stageRef} className={styles.stage} aria-label="Business card">
        <div className={styles.sticky}>
          <div className={styles.entrance}>
            <div className={`${styles.perspective} ${pushed ? styles.pushed : ''}`}>
              <BusinessCard onOpenCareers={onOpenCareers} inert={pushed} />
            </div>
          </div>
        </div>
      </section>
      <ProjectsSheet onOpenCareers={onOpenCareers} inert={pushed} />
    </div>
  );
}
