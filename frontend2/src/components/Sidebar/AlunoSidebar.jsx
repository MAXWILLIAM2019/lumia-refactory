import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import sprintIcon from '../../assets/icons/sprint.svg';
import authService from '../../services/authService';

/**
 * Componente AlunoSidebar
 * Barra lateral de navegação para alunos
 * 
 * Funcionalidades:
 * - Navegação simplificada apenas para o dashboard
 * - Exibição de status ativo da página atual
 * - Logout do aluno
 */
export default function AlunoSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleDashboardClick = () => {
    navigate('/aluno/dashboard');
  };

  const handleLogout = () => {
    authService.removeToken();
    navigate('/aluno/login');
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo e perfil */}
      <div className={styles.logo}>Foca Meta</div>
      <div className={styles.profileCircle}>A</div>

      {/* Menu de navegação - simplificado para alunos */}
      <nav>
        <ul>
          <li 
            className={`${styles.menuItem} ${location.pathname === '/aluno/dashboard' ? styles.active : ''}`}
            onClick={handleDashboardClick}
          >
            <div className={styles.menuItemContent}>
              <img src={sprintIcon} alt="Dashboard" className={styles.icon} />
              <span>Minha Sprint</span>
            </div>
          </li>
          <li 
            className={styles.menuItem}
            onClick={handleLogout}
            style={{ marginTop: 'auto', marginBottom: '20px' }}
          >
            <div className={styles.menuItemContent}>
              <span>Sair</span>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
} 