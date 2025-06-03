import { useLocation } from 'react-router-dom';
import AlunoSidebar from '../Sidebar/AlunoSidebar';
import styles from './Layout.module.css';

export default function AlunoLayout({ children }) {
  const location = useLocation();
  
  return (
    <div className={styles.layout}>
      <AlunoSidebar />
      <main className={styles.mainContent} key={location.pathname}>
        {children}
      </main>
    </div>
  );
} 