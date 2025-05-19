import AlunoSidebar from '../Sidebar/AlunoSidebar';
import styles from './Layout.module.css';

export default function AlunoLayout({ children }) {
  return (
    <div className={styles.layout}>
      <AlunoSidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
} 