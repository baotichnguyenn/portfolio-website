'use client';

import { projects } from '@/lib/content';
import { Figures } from './Figures';
import styles from './ProjectsSheet.module.css';

type Props = {
  onOpenCareers: () => void;
  inert: boolean;
};

/**
 * The second sheet of stock: pulled up from the bottom edge over the card as
 * it turns, then an ordinary page you scroll. It is a normal section in the
 * document — the pull is native scrolling — so it holds any number of rows.
 */
export function ProjectsSheet({ onOpenCareers, inert }: Props) {
  return (
    <section className={styles.sheet} inert={inert || undefined} aria-labelledby="projects-title">
      <header className={styles.head}>
        <h2 id="projects-title" className={styles.heading}>
          Projects
          <span className={styles.count}>
            <Figures>{`${projects.length} Selected`}</Figures>
          </span>
        </h2>
        <button
          type="button"
          className={styles.careersLink}
          onClick={onOpenCareers}
          aria-haspopup="dialog"
        >
          Careers
        </button>
      </header>

      <ul className={styles.grid}>
        {projects.map((project) => (
          <li key={project.id} className={styles.tile}>
            <div className={styles.meta}>
              <span>{project.kind}</span>
              <span>
                <Figures>{project.year}</Figures>
              </span>
            </div>
            <h3 className={styles.title}>
              {project.href ? <a href={project.href}>{project.title}</a> : project.title}
            </h3>
            <p className={styles.blurb}>{project.blurb}</p>
            <p className={styles.stack}>
              {project.stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
