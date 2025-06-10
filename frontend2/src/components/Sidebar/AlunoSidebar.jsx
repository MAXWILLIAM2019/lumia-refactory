import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import sprintIcon from '../../assets/icons/sprint.svg';
import listSprintIcon from '../../assets/icons/list-sprint.svg';
import statsIcon from '../../assets/icons/stats.svg';
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

  const handleTodasSprintsClick = () => {
    navigate('/aluno/sprints');
  };

  const handleEstatisticasClick = () => {
    navigate('/aluno/estatisticas');
  };

  const handleLogout = () => {
    authService.removeToken();
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo e perfil */}
      <div className={styles.logo}>Mentoria</div>
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
            className={`${styles.menuItem} ${location.pathname === '/aluno/sprints' ? styles.active : ''}`}
            onClick={handleTodasSprintsClick}
          >
            <div className={styles.menuItemContent}>
              <img src={listSprintIcon} alt="Todas as Sprints" className={styles.icon} />
              <span>Todas as Sprints</span>
            </div>
          </li>
          <li 
            className={`${styles.menuItem} ${location.pathname === '/aluno/estatisticas' ? styles.active : ''}`}
            onClick={handleEstatisticasClick}
          >
            <div className={styles.menuItemContent}>
              <img src={statsIcon} alt="Minhas Estatísticas" className={styles.icon} />
              <span>Minhas Estatísticas</span>
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