import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={styles.logo}>
      <Link href="/">
        <a title="spacetraveling">
          <img src="images/logo.svg" alt="logo" />
        </a>
      </Link>
    </div>
  );
}
