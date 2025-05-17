import { useState, useEffect } from 'react';
import SprintHeader from '../../components/SprintHeader/SprintHeader';
import SprintStats from '../../components/SprintStats/SprintStats';
import ActivitiesTable from '../../components/ActivitiesTable/ActivitiesTable';
import AuthCheck from '../../components/AuthCheck/AuthCheck';
import styles from './Dashboard.module.css';
import api from '../../services/api';

/**
 * Componente Dashboard
 * Página principal que exibe a sprint atual e suas metas
 */
export default function Dashboard() {
  const [sprint, setSprint] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [nextSprint, setNextSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAuthDebug, setShowAuthDebug] = useState(false);
  const [stats, setStats] = useState({
    performance: '0%',
    hoursStudied: '0h00m',
    questionsSolved: 0,
    dailyAvg: '0h00m'
  });

  useEffect(() => {
    fetchSprints();
  }, []);

  const fetchSprints = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Buscando sprints...');
      
      const response = await api.get('/sprints');
      console.log('Resposta recebida:', response.data);
      
      const data = response.data;
      setSprints(data);
      
      // Ordenar sprints por data de início
      const sortedSprints = [...data].sort((a, b) => 
        new Date(b.dataInicio) - new Date(a.dataInicio)
      );

      if (sortedSprints.length > 0) {
        // Buscar a sprint mais recente com suas metas detalhadas
        fetchSprintById(sortedSprints[0].id);
        
        if (sortedSprints.length > 1) {
          setNextSprint(sortedSprints[1]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar sprints:', error);
      
      // Verificar se é um erro de autenticação
      if (error.response?.status === 401) {
        setError('Erro de autenticação. Por favor, faça login novamente.');
        setShowAuthDebug(true);
      } else {
        setError(`Erro ao carregar sprints: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar uma sprint específica pelo ID
  const fetchSprintById = async (sprintId) => {
    try {
      setLoading(true);
      console.log(`Buscando detalhes da sprint ${sprintId}...`);
      
      const response = await api.get(`/sprints/${sprintId}`);
      console.log('Detalhes da sprint recebida:', response.data);
      
      const sprintData = response.data;
      setSprint(sprintData);
      calculateStats(sprintData);
    } catch (error) {
      console.error(`Erro ao carregar detalhes da sprint ${sprintId}:`, error);
      setError(`Erro ao carregar detalhes da sprint: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a mudança de sprint selecionada
  const handleSprintChange = (sprintId) => {
    if (sprintId) {
      fetchSprintById(sprintId);
    }
  };

  const calculateStats = (currentSprint) => {
    if (!currentSprint || !currentSprint.metas) return;

    const totalMetas = currentSprint.metas.length;
    const completedMetas = currentSprint.metas.filter(m => m.status === 'Concluída').length;
    const totalHours = currentSprint.metas.reduce((acc, curr) => {
      const [hours, minutes] = (curr.tempoEstudado || '00:00').split(':').map(Number);
      return acc + hours + (minutes / 60);
    }, 0);
    const questionsSolved = currentSprint.metas.filter(m => m.tipo === 'questoes' && m.status === 'Concluída').length;
    
    // Calcular média diária
    const startDate = new Date(currentSprint.dataInicio);
    const today = new Date();
    const daysDiff = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    const dailyAvg = totalHours / daysDiff;

    setStats({
      performance: `${((completedMetas / totalMetas) * 100).toFixed(2)}%`,
      hoursStudied: `${Math.floor(totalHours)}h${Math.round((totalHours % 1) * 60)}m`,
      questionsSolved,
      dailyAvg: `${Math.floor(dailyAvg)}h${Math.round((dailyAvg % 1) * 60)}m`
    });
  };

  const formatActivities = (metas) => {
    if (!metas) return [];
    return metas.map(meta => {
      // Formatação do tempo de "HH:MM" para "HHhMMm"
      let tempoFormatado = '--:--';
      if (meta.tempoEstudado && meta.tempoEstudado !== '--:--') {
        const [horas, minutos] = meta.tempoEstudado.split(':');
        tempoFormatado = `${horas}h${minutos}m`;
      }

      // Formatação da relevância: sempre 5 estrelas, com as primeiras N pintadas
      const relevancia = meta.relevancia || 0;
      const relevanciaFormatada = {
        total: 5,
        preenchidas: relevancia
      };

      return {
        disciplina: meta.disciplina,
        tipo: meta.tipo,
        titulo: meta.titulo,
        relevancia: relevanciaFormatada,
        tempo: tempoFormatado,
        desempenho: meta.desempenho ? `${meta.desempenho}%` : '--',
        comando: meta.comandos || '',
        link: meta.link || '',
        status: meta.status || 'Pendente',
        codigo: meta.id,
        totalQuestoes: meta.totalQuestoes,
        questoesCorretas: meta.questoesCorretas
      };
    });
  };

  if (loading && !sprint) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.dashboard}>
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchSprints} className={styles.retryButton}>
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
      
      <div className={styles.sprintRow}>
        <div className={styles.sprintContainer}>
          <SprintHeader 
            sprintTitle={sprint?.nome}
            progress={sprint ? (sprint.metas.filter(m => m.status === 'Concluída').length / sprint.metas.length) * 100 : 0}
            startDate={sprint?.dataInicio}
            onSprintChange={handleSprintChange}
          >
            <SprintStats stats={stats} />
          </SprintHeader>
        </div>
        {nextSprint && (
          <div className={styles.nextSprintContainer}>
            <span className="nextLabel">Próxima Sprint</span>
            <strong className="nextTitle">{nextSprint.nome}</strong>
            <span className="nextDate">
              Próxima em: {new Date(nextSprint.dataInicio).toLocaleDateString('pt-BR')}
            </span>
            <button className="addButton">Adicionar sprint</button>
          </div>
        )}
      </div>
      <div className={styles.metasContainer}>
        {sprint && (
          <ActivitiesTable 
            activities={formatActivities(sprint.metas)}
            onFilterChange={(filter) => {
              // Implementar filtro
            }}
            onRefresh={() => {
              if (sprint) {
                fetchSprintById(sprint.id);
              }
            }}
          />
        )}
      </div>
      {loading && <div className={styles.loadingOverlay}>Carregando metas...</div>}
    </div>
  );
} 