import { CardFront } from './CardFront';
import styles from './BusinessCard.module.css';

type Props = {
  onOpenCareers: () => void;
  inert: boolean;
};

/**
 * One face. The card never turns far enough to show its reverse: the projects
 * sheet covers it on the way up, so there is nothing printed on the back.
 */
export function BusinessCard({ onOpenCareers, inert }: Props) {
  return (
    <div className={styles.flipper} inert={inert || undefined}>
      <div className={styles.face}>
        <CardFront onOpenCareers={onOpenCareers} />
      </div>
    </div>
  );
}
