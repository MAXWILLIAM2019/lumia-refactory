/**
 * Layout Principal do Administrador
 * 
 * Este componente fornece a estrutura base para todas as páginas administrativas do sistema.
 * 
 * Responsabilidades:
 * - Renderiza a sidebar com menu administrativo completo
 * - Gerencia navegação entre funcionalidades administrativas
 * - Exibe alerta de impersonation quando necessário
 * - Gerencia o retorno do modo de impersonation
 * 
 * TODO: Refatoração necessária - Extrair lógica de impersonation
 * O alerta e a lógica de impersonation se repetem em Layout.jsx e AlunoLayout.jsx
 * Sugestão: Criar um componente ImpersonationAlert.jsx separado seguindo o princípio DRY
 * 
 * Rotas que utilizam este layout:
 * - /dashboard (Dashboard administrativo)
 * - /alunos/cadastrar (Cadastro de alunos)
 * - /planos/cadastrar (Cadastro de planos)
 * - /sprints (Gerenciamento de sprints)
 * - /disciplinas (Gerenciamento de disciplinas)
 * 
 * @component
 * @param {Object} props
 * @param {ReactNode} props.children - Conteúdo principal a ser renderizado dentro do layout
 */
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.css';
import authService from '../../services/authService';
import api from '../../services/api';

export default function Layout({ children }) {
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
      <Sidebar />
      <main className={styles.mainContent}>
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