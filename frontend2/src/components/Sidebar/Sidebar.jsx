import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegisterClick = () => {
    navigate('/register-sprint');
  };

  const handleSprintClick = () => {
    navigate('/');
  };

  const handleRegisterStudentClick = () => {
    navigate('/register-student');
  };

  const handleRegisterPlanClick = () => {
    navigate('/register-plan');
  };

  return (
    <aside className={`${styles.sidebar} ${!isOpen ? styles.closed : ''}`}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? '←' : '→'}
      </button>
      <div className={styles.logo}>Foca Meta</div>
      <div className={styles.profileCircle}>B</div>
      <nav>
        <ul>
          <li 
            className={location.pathname === '/' ? styles.active : ''} 
            onClick={handleSprintClick}
          >
            Sprint
          </li>
          <li>Arquivo</li>
          <li>Desempenho</li>
          <li>Comparativo</li>
          <li>Jornada</li>
          <li>Coordenadas <span className={styles.badge}>5</span></li>
          <li>Tutoriais <span className={styles.badge}>9+</span></li>
          <li>Favoritos <span className={styles.new}>NEW</span></li>
          <li>Meu Perfil</li>
          <li className={styles.registerButton} onClick={handleRegisterClick}>
            Cadastrar sprints
          </li>
          <li className={styles.registerPlanButton} onClick={handleRegisterPlanClick}>
            Cadastrar plano
          </li>
          <li className={styles.registerStudentButton} onClick={handleRegisterStudentClick}>
            Cadastrar aluno
          </li>
        </ul>
      </nav>
    </aside>
  );
} 