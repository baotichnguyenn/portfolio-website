'use client';

import { projects } from '@/lib/content';
import styles from './ProjectsGrid.module.css';

export function ProjectsGrid({ onOpenCareers }: { onOpenCareers: () => void }) {
  return (
    <div className={styles.back}>
      <header className={styles.head}>
        <h2 className={styles.heading}>
          Projects <span className={styles.count}>{projects.length} Selected</span>
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
              <span>{project.year}</span>
            </div>
            <div className={styles.tileBody}>
              <h3 className={styles.tileTitle}>
                {project.href ? <a href={project.href}>{project.title}</a> : project.title}
              </h3>
              <p className={styles.blurb}>{project.blurb}</p>
            </div>
            <div className={styles.stack}>
              {project.stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
