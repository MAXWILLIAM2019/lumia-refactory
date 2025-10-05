import { useState, useEffect } from 'react';
import AuthCheck from '../../components/AuthCheck/AuthCheck';
import styles from './Dashboard.module.css';
import api from '../../services/api';
import authService from '../../services/authService';

/**
 * Componente Dashboard do Administrador
 * Página principal que exibe resumo do sistema para administradores
 */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAuthDebug, setShowAuthDebug] = useState(false);
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalPlanos: 0,
    totalSprints: 0,
    totalDisciplinas: 0
  });
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    fetchUsuarioInfo();
    fetchDashboardStats();
  }, []);

  // Busca informações do usuário administrador
  const fetchUsuarioInfo = async () => {
    try {
      console.log('Buscando informações do administrador...');
      const response = await api.get('/auth/me');
      console.log('Dados do administrador recebidos:', response.data);
      
      if (response.data && response.data.administrador) {
        setUsuario(response.data.administrador);
      } else if (response.data && response.data.usuario) {
        // Fallback para dados básicos do usuário
        setUsuario({
          nome: response.data.usuario.nome,
          email: response.data.usuario.adminInfo?.email || response.data.usuario.login
        });
      }
    } catch (error) {
      console.error('Erro ao buscar informações do administrador:', error);
      setError('Erro ao carregar informações do usuário.');
    }
  };

  // Busca estatísticas do sistema para o dashboard
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Buscando estatísticas do dashboard...');
      
      // Buscar dados em paralelo
      const [alunosResp, planosResp, sprintsResp, disciplinasResp] = await Promise.all([
        api.get('/alunos').catch(() => ({ data: [] })),
        api.get('/planos').catch(() => ({ data: [] })),
        api.get('/sprints').catch(() => ({ data: [] })),
        api.get('/disciplinas').catch(() => ({ data: [] }))
      ]);

      setStats({
        totalAlunos: Array.isArray(alunosResp.data) ? alunosResp.data.length : 0,
        totalPlanos: Array.isArray(planosResp.data) ? planosResp.data.length : 0,
        totalSprints: Array.isArray(sprintsResp.data) ? sprintsResp.data.length : 0,
        totalDisciplinas: Array.isArray(disciplinasResp.data) ? disciplinasResp.data.length : 0
      });
      
      console.log('Estatísticas carregadas:', {
        alunos: alunosResp.data?.length || 0,
        planos: planosResp.data?.length || 0,
        sprints: sprintsResp.data?.length || 0,
        disciplinas: disciplinasResp.data?.length || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError('Erro ao carregar estatísticas do sistema.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.dashboard}>
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchDashboardStats} className={styles.retryButton}>
            Tentar novamente
          </button>
        </div>
      )}
      
      {showAuthDebug && (
        <div className={styles.authDebug}>
          <h3>Diagnóstico de Autenticação</h3>
          <AuthCheck />
          <p className={styles.hint}>
            Se o token estiver ausente ou inválido, tente fazer <a href="/login">login novamente</a>
          </p>
        </div>
      )}
      
      {/* Header de boas-vindas */}
      <div className={styles.welcomeHeader}>
        <h1>Painel Administrativo</h1>
        {usuario && (
          <p>Bem-vindo, {usuario.nome?.split(' ')[0] || 'Administrador'}!</p>
        )}
      </div>
      
      {/* Cards de estatísticas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <h3>Alunos Cadastrados</h3>
            <p className={styles.statNumber}>{stats.totalAlunos}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statContent}>
            <h3>Planos de Estudo</h3>
            <p className={styles.statNumber}>{stats.totalPlanos}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏃‍♂️</div>
          <div className={styles.statContent}>
            <h3>Sprints Criadas</h3>
            <p className={styles.statNumber}>{stats.totalSprints}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎓</div>
          <div className={styles.statContent}>
            <h3>Disciplinas</h3>
            <p className={styles.statNumber}>{stats.totalDisciplinas}</p>
          </div>
        </div>
      </div>
      
      {/* Informações importantes */}
      <div className={styles.infoSection}>
        <h2>Informações do Sistema</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>📊 Relatórios</h3>
            <p>Visualize estatísticas e relatórios detalhados do sistema.</p>
            <p><em>Em desenvolvimento</em></p>
          </div>
          
          <div className={styles.infoCard}>
            <h3>⚙️ Configurações</h3>
            <p>Gerencie configurações do sistema e preferências.</p>
            <p><em>Em desenvolvimento</em></p>
          </div>
          
          <div className={styles.infoCard}>
            <h3>🔔 Notificações</h3>
            <p>Sistema de notificações para alunos e administradores.</p>
            <p><em>Em desenvolvimento</em></p>
          </div>
        </div>
      </div>
      
      {loading && <div className={styles.loadingOverlay}>Carregando dados...</div>}
    </div>
  );
} 