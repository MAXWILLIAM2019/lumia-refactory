import { useState, useEffect } from 'react';
import SprintHeader from '../../components/SprintHeader/SprintHeader';
import SprintStats from '../../components/SprintStats/SprintStats';
import ActivitiesTable from '../../components/ActivitiesTable/ActivitiesTable';
import AuthCheck from '../../components/AuthCheck/AuthCheck';
import styles from '../Dashboard/Dashboard.module.css';
import api from '../../services/api';

/**
 * Componente AcompanharSprints
 * Página para administradores acompanharem sprints e metas do sistema
 */
export default function AcompanharSprints() {
  const [sprints, setSprints] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
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
    fetchAllSprints();
  }, []);

  // Busca todas as sprints do sistema
  const fetchAllSprints = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Buscando todas as sprints do sistema...');
      
      const response = await api.get('/sprints');
      console.log('Sprints recebidas:', response.data);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        setSprints(response.data);
        // Seleciona a primeira sprint por padrão
        const firstSprint = response.data[0];
        setCurrentSprint(firstSprint);
        calculateStats(firstSprint);
      } else {
        setError('Nenhuma sprint cadastrada no sistema.');
        setSprints([]);
        setCurrentSprint(null);
      }
    } catch (error) {
      console.error('Erro ao carregar sprints:', error);
      if (error.response?.status === 401) {
        setError('Erro de autenticação. Por favor, faça login novamente.');
        setShowAuthDebug(true);
      } else {
        setError(`Erro ao carregar sprints: ${error.message || 'Erro desconhecido'}`);
      }
      setSprints([]);
      setCurrentSprint(null);
    } finally {
      setLoading(false);
    }
  };

  // Mudança de sprint selecionada
  const handleSprintChange = async (sprintId) => {
    try {
      console.log('Mudando para sprint:', sprintId);
      const sprint = sprints.find(s => s.id === parseInt(sprintId));
      if (sprint) {
        setCurrentSprint(sprint);
        calculateStats(sprint);
      }
    } catch (error) {
      console.error('Erro ao mudar sprint:', error);
    }
  };

  const calculateStats = (sprint) => {
    if (!sprint || !sprint.metas) {
      setStats({
        performance: '0%',
        hoursStudied: '0h00m',
        questionsSolved: 0,
        dailyAvg: '0h00m'
      });
      return;
    }

    const totalMetas = sprint.metas.length;
    const completedMetas = sprint.metas.filter(m => m.status === 'Concluída').length;
    
    // Calcular horas totais
    const totalHours = sprint.metas.reduce((acc, curr) => {
      const [hours, minutes] = (curr.tempoEstudado || '00:00').split(':').map(Number);
      return acc + hours + (minutes / 60);
    }, 0);
    
    // Filtrar apenas metas que:
    // 1. Foram concluídas
    // 2. Têm questões resolvidas (totalQuestoes > 0)
    // 3. Têm um desempenho válido
    const metasComDesempenho = sprint.metas.filter(m => 
      m.status === 'Concluída' && 
      m.totalQuestoes > 0 && 
      m.desempenho !== undefined && 
      m.desempenho !== null && 
      !isNaN(parseFloat(m.desempenho))
    );
    
    // Calcular desempenho médio apenas das metas que têm questões resolvidas
    let desempenhoMedio = 0;
    if (metasComDesempenho.length > 0) {
      const somaDesempenhos = metasComDesempenho.reduce((acc, meta) => 
        acc + parseFloat(meta.desempenho), 0
      );
      desempenhoMedio = somaDesempenhos / metasComDesempenho.length;
    }
    
    // Calcular total de questões resolvidas (soma de totalQuestoes de todas as metas concluídas)
    const questionsSolved = sprint.metas
      .filter(m => m.status === 'Concluída')
      .reduce((acc, meta) => acc + (meta.totalQuestoes || 0), 0);
    
    // Calcular média diária
    const startDate = new Date(sprint.dataInicio);
    const today = new Date();
    const daysDiff = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    const dailyAvg = totalHours / daysDiff;

    // Formatar desempenho com duas casas decimais
    const performanceFormatada = `${desempenhoMedio.toFixed(2).replace('.', ',')}%`;

    setStats({
      performance: performanceFormatada,
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
      
      // Formatação do desempenho com duas casas decimais
      let desempenhoFormatado = '--';
      if (meta.desempenho) {
        // Converter para número, fixar em 2 casas decimais e substituir ponto por vírgula
        desempenhoFormatado = `${parseFloat(meta.desempenho).toFixed(2).replace('.', ',')}%`;
      }

      return {
        disciplina: meta.disciplina,
        tipo: meta.tipo,
        titulo: meta.titulo,
        relevancia: relevanciaFormatada,
        tempo: tempoFormatado,
        desempenho: desempenhoFormatado,
        comando: meta.comandos || '',
        link: meta.link || '',
        status: meta.status || 'Pendente',
        codigo: meta.id,
        totalQuestoes: meta.totalQuestoes,
        questoesCorretas: meta.questoesCorretas
      };
    });
  };

  if (loading) {
    return <div className={styles.loading}>Carregando sprints...</div>;
  }

  return (
    <div className={styles.dashboard}>
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchAllSprints} className={styles.retryButton}>
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
      
      {/* Header da página */}
      <div className={styles.pageHeader}>
        <h1>Acompanhar Sprints</h1>
        <p>Monitore o progresso das sprints e metas cadastradas no sistema</p>
      </div>
      
      <div className={styles.sprintRow}>
        <div className={styles.sprintContainer}>
          <SprintHeader 
            sprintTitle={currentSprint?.nome}
            progress={currentSprint ? (currentSprint.metas?.filter(m => m.status === 'Concluída').length / (currentSprint.metas?.length || 1)) * 100 : 0}
            startDate={currentSprint?.dataInicio}
            sprints={sprints}
            selectedSprintId={currentSprint?.id}
            onSprintChange={handleSprintChange}
          >
            <SprintStats stats={stats} />
          </SprintHeader>
        </div>
      </div>
      
      <div className={styles.metasContainer}>
        {currentSprint && (
          <ActivitiesTable 
            activities={formatActivities(currentSprint.metas)}
            onFilterChange={() => {}}
            onRefresh={fetchAllSprints}
          />
        )}
      </div>
      
      {loading && <div className={styles.loadingOverlay}>Carregando metas...</div>}
    </div>
  );
} 