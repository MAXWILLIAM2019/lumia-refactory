import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

/**
 * Componente Sidebar
 * Barra lateral de navegação da aplicação
 * 
 * Funcionalidades:
 * - Navegação entre páginas
 * - Botão para expandir/recolher a sidebar
 * - Exibição de status ativo da página atual
 * - Botões de ação para cadastros e listagens
 */
export default function Sidebar() {
  // Estado para controlar se a sidebar está expandida ou recolhida
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Funções de navegação para diferentes seções da aplicação
   */
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

  const handleListPlansClick = () => {
    navigate('/planos');
  };

  return (
    <aside className={`${styles.sidebar} ${!isOpen ? styles.closed : ''}`}>
      {/* Botão para expandir/recolher a sidebar */}
      <button 
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? '←' : '→'}
      </button>

      {/* Logo e perfil */}
      <div className={styles.logo}>Foca Meta</div>
      <div className={styles.profileCircle}>B</div>

      {/* Menu de navegação */}
      <nav>
        <ul>
          {/* Item de menu ativo baseado na rota atual */}
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

          {/* Botões de ação */}
          <li className={styles.registerButton} onClick={handleRegisterClick}>
            Cadastrar sprints
          </li>
          <li className={styles.registerPlanButton} onClick={handleRegisterPlanClick}>
            Cadastrar plano
          </li>
          <li className={styles.listPlansButton} onClick={handleListPlansClick}>
            Listar planos
          </li>
          <li className={styles.registerStudentButton} onClick={handleRegisterStudentClick}>
            Cadastrar aluno
          </li>
        </ul>
      </nav>
    </aside>
  );
} 