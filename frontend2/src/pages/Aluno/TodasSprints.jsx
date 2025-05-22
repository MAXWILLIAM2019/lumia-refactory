import { useState, useEffect } from 'react';
import styles from './TodasSprints.module.css';
import api from '../../services/api';

/**
 * Componente TodasSprints
 * Exibe a lista de todas as sprints associadas ao aluno
 */
export default function TodasSprints() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [planoInfo, setPlanoInfo] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    fetchUsuarioInfo();
  }, []);

  const fetchUsuarioInfo = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.aluno) {
        setUsuario(response.data.aluno);
        await fetchAlunoPlano();
      }
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      setError('Erro ao buscar informações do usuário.');
      setLoading(false);
    }
  };

  const fetchAlunoPlano = async () => {
    try {
      const planoResp = await api.get('/aluno-plano/meu-plano');
      if (planoResp.data && planoResp.data.planoId) {
        setPlanoInfo(planoResp.data.plano);
        await fetchSprintsDoPlano(planoResp.data.planoId);
      } else {
        setError('Você não possui planos de estudo atribuídos.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao buscar plano do aluno:', error);
      setError('Erro ao buscar plano do aluno.');
      setLoading(false);
    }
  };

  const fetchSprintsDoPlano = async (planoId) => {
    try {
      setLoading(true);
      const response = await api.get(`/planos/${planoId}/sprints`);
      
      // Buscar detalhes completos de cada sprint
      const sprintsComDetalhes = await Promise.all(
        response.data.map(async (sprint) => {
          try {
            const sprintDetalhes = await api.get(`/sprints/${sprint.id}`);
            return sprintDetalhes.data;
          } catch (error) {
            console.error(`Erro ao buscar detalhes da sprint ${sprint.id}:`, error);
            return sprint;
          }
        })
      );
      
      // Ordenar sprints por posição ou data de início
      const sortedSprints = [...sprintsComDetalhes].sort((a, b) => {
        if (a.posicao !== undefined && b.posicao !== undefined) {
          return a.posicao - b.posicao;
        }
        return new Date(a.dataInicio) - new Date(b.dataInicio);
      });
      
      setSprints(sortedSprints);
    } catch (error) {
      console.error('Erro ao buscar sprints:', error);
      setError('Erro ao buscar sprints do plano.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateStats = (metas) => {
    if (!metas || metas.length === 0) return {
      performance: '0%',
      hoursStudied: '0h00m',
      questionsSolved: 0,
      dailyAvg: '0h00m'
    };

    // Calcular horas totais
    const totalHours = metas.reduce((acc, curr) => {
      const [hours, minutes] = (curr.tempoEstudado || '00:00').split(':').map(Number);
      return acc + hours + (minutes / 60);
    }, 0);

    // Calcular desempenho como média dos desempenhos das metas
    const metasComDesempenho = metas.filter(m => 
      m.desempenho !== undefined && m.desempenho !== null && !isNaN(parseFloat(m.desempenho))
    );
    
    let desempenhoMedio = 0;
    if (metasComDesempenho.length > 0) {
      const somaDesempenhos = metasComDesempenho.reduce((acc, meta) => 
        acc + parseFloat(meta.desempenho), 0
      );
      desempenhoMedio = somaDesempenhos / metasComDesempenho.length;
    }

    // Calcular total de questões resolvidas
    const questionsSolved = metas.reduce((acc, meta) => 
      acc + (meta.totalQuestoes || 0), 0
    );

    return {
      performance: `${desempenhoMedio.toFixed(2).replace('.', ',')}%`,
      hoursStudied: `${Math.floor(totalHours)}h${Math.round((totalHours % 1) * 60)}m`,
      questionsSolved,
      dailyAvg: `${Math.floor(totalHours / metas.length)}h${Math.round(((totalHours / metas.length) % 1) * 60)}m`
    };
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Carregando sprints...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Minhas Sprints</h1>
        {usuario && planoInfo && (
          <div className={styles.planoInfo}>
            <h2>Olá, {usuario.nome.split(' ')[0]} | {planoInfo.nome} - {planoInfo.cargo}</h2>
            <p>{planoInfo.descricao}</p>
          </div>
        )}
      </div>

      <div className={styles.sprintsGrid}>
        {sprints.map((sprint) => {
          const stats = calculateStats(sprint.metas);
          const progress = sprint.metas ? (sprint.metas.filter(m => m.status === 'Concluída').length / sprint.metas.length) * 100 : 0;
          
          return (
            <div key={sprint.id} className={styles.sprintCard}>
              <div className={styles.sprintHeader}>
                <h3>{sprint.nome}</h3>
                <span className={`${styles.status} ${styles[sprint.status?.toLowerCase() || 'pendente']}`}>
                  {sprint.status || 'Pendente'}
                </span>
              </div>
              
              <div className={styles.sprintProgress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className={styles.progressText}>
                  {Math.round(progress)}% Concluído
                </span>
              </div>

              <div className={styles.sprintDetails}>
                <div className={styles.detail}>
                  <span className={styles.label}>Início:</span>
                  <span>{formatDate(sprint.dataInicio)}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Fim:</span>
                  <span>{formatDate(sprint.dataFim)}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Metas:</span>
                  <span>{sprint.metas?.length || 0} atividades</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Concluídas:</span>
                  <span>{sprint.metas?.filter(m => m.status === 'Concluída').length || 0}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Desempenho:</span>
                  <span>{stats.performance}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Horas Estudadas:</span>
                  <span>{stats.hoursStudied}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Questões Resolvidas:</span>
                  <span>{stats.questionsSolved}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Média Diária:</span>
                  <span>{stats.dailyAvg}</span>
                </div>
              </div>

              <div className={styles.sprintDescription}>
                <p>{sprint.descricao}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 