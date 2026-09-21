import { CardFront } from './CardFront';
import { ProjectsGrid } from './ProjectsGrid';
import styles from './BusinessCard.module.css';

type Props = {
  onOpenCareers: () => void;
  inert: boolean;
};

export function BusinessCard({ onOpenCareers, inert }: Props) {
  return (
    <div className={styles.lift}>
      <div className={styles.flipper} inert={inert || undefined}>
        <div className={`${styles.face} ${styles.front}`}>
          <CardFront onOpenCareers={onOpenCareers} />
        </div>
        <div className={`${styles.face} ${styles.back}`}>
          <ProjectsGrid onOpenCareers={onOpenCareers} />
        </div>
      </div>
    </div>
  );
}
