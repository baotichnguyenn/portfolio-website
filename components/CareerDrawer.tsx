'use client';

import { useEffect, useRef } from 'react';
import { career, type CareerNode } from '@/lib/content';
import { Figures } from './Figures';
import styles from './CareerDrawer.module.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CareerDrawer({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    document.body.dataset.scrollLocked = 'true';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      delete document.body.dataset.scrollLocked;
      restoreRef.current?.focus();
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="careers-title"
      >
        <header className={styles.head}>
          <h2 id="careers-title" className={styles.title}>
            Careers
          </h2>
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
            Close
          </button>
        </header>

        <div className={styles.body}>
          <Branch nodes={career} open={open} root />
        </div>
      </div>
    </>
  );
}

function Branch({
  nodes,
  open,
  root = false,
  depth = 0,
}: {
  nodes: CareerNode[];
  open: boolean;
  root?: boolean;
  depth?: number;
}) {
  return (
    <ul className={`${root ? styles.tree : styles.subtree} ${root ? styles.root : ''}`}>
      {nodes.map((node, index) => (
        <li
          key={node.id}
          className={`${styles.node} ${open ? styles.nodeVisible : ''}`}
          style={{ '--i': depth * 2 + index } as React.CSSProperties}
        >
          <h3 className={styles.role}>{node.role}</h3>
          <p className={styles.org}>
            {node.org}
            {node.location ? ` — ${node.location}` : ''}
          </p>
          <p className={styles.period}>
            <Figures>{node.period}</Figures>
          </p>
          {node.summary && <p className={styles.summary}>{node.summary}</p>}
          {node.highlights && node.highlights.length > 0 && (
            <ul className={styles.highlights}>
              {node.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {node.children && node.children.length > 0 && (
            <Branch nodes={node.children} open={open} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}
