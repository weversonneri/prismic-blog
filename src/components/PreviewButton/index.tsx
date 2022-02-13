import Link from 'next/link';
import styles from './styles.module.scss';

export function PreviewButton(): JSX.Element {
  return (
    <aside>
      <Link href="/api/exit-preview">
        <a className={styles.aside}>Sair do modo Preview</a>
      </Link>
    </aside>
  );
}
