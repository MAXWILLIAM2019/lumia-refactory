import { useState, useEffect } from 'react';
import styles from './TodasSprints.module.css';
import api from '../../services/api';

/**
 * Visualização de Todas as Sprints
 * 
 * Componente que lista todas as sprints disponíveis para o aluno:
 * - Exibe informações do usuário e plano
 * - Lista sprints em ordem cronológica
 * - Mostra progresso de cada sprint
 * 
 * Suporta modo de impersonation:
 * - Exibe informações do aluno sendo impersonado
 * - Mantém consistência com o padrão: "Olá, {nome} ({plano} - {cargo})"
 */

/**
 * Componente TodasSprints
 * ATENÇÃO: Este componente é específico para a interface do aluno e utiliza apenas
 * as rotas de instâncias (não os templates). NÃO alterar a lógica de busca
 * sem consultar o time de desenvolvimento.
 * 
 * Exibe a lista de todas as sprints instanciadas associadas ao aluno.
 * Utiliza a rota /planos/:id/sprints-instancia para buscar as sprints,
 * que retorna as instâncias específicas do aluno (não os templates).
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

  /**
   * Busca as informações do usuário logado
   * ATENÇÃO: Função necessária para identificar o aluno e seu plano associado
   */
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

  /**
   * Busca o plano associado ao aluno
   * ATENÇÃO: Função necessária para obter o ID do plano instanciado do aluno
   */
  const fetchAlunoPlano = async () => {
    try {
      const planoResp = await api.get('/aluno-plano/meu-plano');
      
      if (planoResp.data) {
        // A resposta já vem com o plano aninhado
        setPlanoInfo(planoResp.data.plano);
        await fetchSprintsDoPlano(planoResp.data.PlanoId);
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

  /**
   * Busca as sprints instanciadas do plano do aluno
   * ATENÇÃO: Esta função utiliza a rota específica para instâncias
   * NÃO alterar para usar a rota de templates sem consultar o time
   */
  const fetchSprintsDoPlano = async (planoId) => {
    try {
      setLoading(true);
      const response = await api.get(`/planos/${planoId}/sprints-instancia`);
      
      // Ordenar sprints por posição ou data de início
      const sortedSprints = [...response.data].sort((a, b) => {
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

  /**
   * Formata uma data para exibição
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  /**
   * Calcula estatísticas de uma sprint
   * ATENÇÃO: Função que processa dados específicos das instâncias
   */
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

    // Filtrar apenas metas que:
    // 1. Foram concluídas
    // 2. Têm questões resolvidas (totalQuestoes > 0)
    // 3. Têm um desempenho válido
    const metasComDesempenho = metas.filter(m => 
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
    const questionsSolved = metas
      .filter(m => m.status === 'Concluída')
      .reduce((acc, meta) => acc + (meta.totalQuestoes || 0), 0);

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
            <h2>Olá, {usuario.nome.split(' ')[0]} ({planoInfo.nome} - {planoInfo.cargo})</h2>
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
                  <span>{sprint.metas?.length || 0} metas</span>
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