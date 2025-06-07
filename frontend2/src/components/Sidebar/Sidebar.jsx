import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import sprintIcon from '../../assets/icons/sprint.svg';
import registerPlanIcon from '../../assets/icons/register-plan.svg';
import registerStudentIcon from '../../assets/icons/register-student.svg';
import disciplinasIcon from '../../assets/icons/disciplinas.svg';

/**
 * Componente Sidebar
 * Barra lateral de navegação da aplicação
 * 
 * Funcionalidades:
 * - Navegação entre páginas
 * - Exibição de status ativo da página atual
 * - Botões de ação para cadastros e listagens
 */
export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSprintClick = () => {
    navigate('/dashboard');
  };

  const handleRegisterStudentClick = () => {
    navigate('/alunos/cadastrar');
  };

  const handleRegisterPlanClick = () => {
    navigate('/planos/cadastrar');
  };

  const handleDisciplinasClick = () => {
    navigate('/disciplinas');
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo e perfil */}
      <div className={styles.logo}>Mentoria</div>
      <div className={styles.profileCircle}>B</div>

      {/* Menu de navegação */}
      <nav>
        <ul>
          <li 
            className={`${styles.menuItem} ${location.pathname === '/' || location.pathname === '/dashboard' ? styles.active : ''}`}
            onClick={handleSprintClick}
          >
            <div className={styles.menuItemContent}>
              <img src={sprintIcon} alt="Dashboard" className={styles.icon} />
              <span>Dashboard</span>
            </div>
          </li>
          <li 
            className={styles.menuItem}
            onClick={handleRegisterPlanClick}
          >
            <div className={styles.menuItemContent}>
              <img src={registerPlanIcon} alt="Planos" className={styles.icon} />
              <span>Planos</span>
            </div>
          </li>
          <li 
            className={`${styles.menuItem} ${location.pathname === '/disciplinas' || location.pathname.startsWith('/disciplinas/') ? styles.active : ''}`}
            onClick={handleDisciplinasClick}
          >
            <div className={styles.menuItemContent}>
              <img src={disciplinasIcon} alt="Disciplinas" className={styles.icon} />
              <span>Disciplinas</span>
            </div>
          </li>
          <li 
            className={styles.menuItem}
            onClick={handleRegisterStudentClick}
          >
            <div className={styles.menuItemContent}>
              <img src={registerStudentIcon} alt="Alunos" className={styles.icon} />
              <span>Alunos</span>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
} 