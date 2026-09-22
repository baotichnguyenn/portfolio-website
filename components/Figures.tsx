import styles from './Figures.module.css';

/**
 * Sets digit runs smaller than the capitals around them, as the reference card
 * does — "358 EXCHANGE PLACE", "FAX 212.555.6390". Measured on the photo the
 * figures stand 0.86 of the cap height. Separators inside a number (dots,
 * commas, slashes, hyphens) travel with it, so "212.555.6390" stays one run.
 */
export function Figures({ children }: { children: string }) {
  const parts = children.split(/(\d(?:[\d.,/-]*\d)?)/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={styles.fig}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
