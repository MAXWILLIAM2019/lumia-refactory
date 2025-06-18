/**
 * Layout Principal do Aluno
 * 
 * Este componente fornece a estrutura base para todas as páginas da área do aluno.
 * É um layout simplificado, focado na experiência do usuário aluno.
 * 
 * Responsabilidades:
 * - Renderiza a sidebar simplificada para alunos
 * - Gerencia navegação entre funcionalidades do aluno
 * - Exibe alerta de impersonation quando um admin está visualizando como aluno
 * - Gerencia o retorno do modo de impersonation
 * 
 * TODO: Refatoração necessária - Extrair lógica de impersonation
 * O alerta e a lógica de impersonation se repetem em Layout.jsx e AlunoLayout.jsx
 * Sugestão: Criar um componente ImpersonationAlert.jsx separado seguindo o princípio DRY
 * 
 * Rotas que utilizam este layout:
 * - /aluno/dashboard (Dashboard do aluno)
 * - /aluno/sprints (Visualização de sprints)
 * - /aluno/estatisticas (Estatísticas de desempenho)
 * 
 * @component
 * @param {Object} props
 * @param {ReactNode} props.children - Conteúdo principal a ser renderizado dentro do layout
 */
import { useLocation, useNavigate } from 'react-router-dom';
import AlunoSidebar from '../Sidebar/AlunoSidebar';
import styles from './Layout.module.css';
import authService from '../../services/authService';
import api from '../../services/api';

export default function AlunoLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isImpersonating = authService.isImpersonating();
  const originalRole = authService.getOriginalRole();
  const impersonatedUser = authService.getImpersonatedUser();

  /**
   * Gerencia o retorno do modo de impersonation para a conta administrativa
   * 
   * Fluxo:
   * 1. Restaura o token original do administrador
   * 2. Aguarda processamento do token
   * 3. Atualiza headers de autenticação
   * 4. Redireciona para o dashboard administrativo
   * 
   * @async
   * @function
   */
  const handleStopImpersonation = async () => {
    try {
      // Para o impersonation e restaura o token original
      authService.stopImpersonation();
      
      // Aguarda um pequeno intervalo para garantir que o token foi processado
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Força uma atualização do token no Axios antes de redirecionar
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      }
      
      // Redireciona para o dashboard do administrador
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Erro ao parar impersonation:', error);
      // Em caso de erro, faz logout completo
      authService.removeToken();
      navigate('/login');
    }
  };
  
  return (
    <div className={styles.layout}>
      <AlunoSidebar />
      <main className={styles.mainContent} key={location.pathname}>
        {/* Alerta de impersonation - exibido apenas quando um admin está visualizando como aluno */}
        {isImpersonating && (
          <div className={styles.impersonationAlert}>
            <span>👁️ Você está visualizando como {impersonatedUser?.nome || 'Aluno'}</span>
            <button onClick={handleStopImpersonation}>Voltar para conta administrativa</button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
} 