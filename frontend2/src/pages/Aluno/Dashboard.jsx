import { useState, useEffect } from 'react';
import SprintHeader from '../../components/SprintHeader/SprintHeader';
import SprintStats from '../../components/SprintStats/SprintStats';
import ActivitiesTable from '../../components/ActivitiesTable/ActivitiesTable';
import AuthCheck from '../../components/AuthCheck/AuthCheck';
import styles from '../../pages/Dashboard/Dashboard.module.css';
import api from '../../services/api';

/**
 * Componente Dashboard do Aluno
 * Página principal que exibe a sprint atual do aluno e suas metas
 */
export default function AlunoDashboard() {
  const [sprint, setSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAuthDebug, setShowAuthDebug] = useState(false);
  const [stats, setStats] = useState({
    performance: '0%',
    hoursStudied: '0h00m',
    questionsSolved: 0,
    dailyAvg: '0h00m'
  });
  const [usuario, setUsuario] = useState(null);
  const [planoInfo, setPlanoInfo] = useState(null);

  useEffect(() => {
    fetchUsuarioInfo();
    fetchAlunoPrimeiroSprint();
  }, []);

  const fetchUsuarioInfo = async () => {
    try {
      const response = await api.get('/auth/me');
      console.log('Dados do usuário:', response.data);
      setUsuario(response.data.aluno);
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
    }
  };

  const fetchAlunoPrimeiroSprint = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('1. Buscando sprints do aluno...');
      
      // Buscar informações do usuário, se ainda não tiver
      if (!usuario) {
        await fetchUsuarioInfo();
      }
      
      // Buscar informações do plano
      try {
        console.log('2. Buscando planos do aluno...');
        const planosResponse = await api.get('/alunos/planos');
        console.log('3. Planos do aluno:', planosResponse.data);
        
        if (!planosResponse.data || planosResponse.data.length === 0) {
          setError('Você não possui planos de estudo atribuídos.');
          setLoading(false);
          return;
        }
        
        // Pegar o primeiro plano
        const planoId = planosResponse.data[0].planoId;
        console.log('4. ID do primeiro plano:', planoId);
        
        // Buscar informações detalhadas do plano
        console.log('5. Buscando informações detalhadas do plano...');
        const planoResponse = await api.get(`/planos/${planoId}`);
        console.log('6. Detalhes do plano:', planoResponse.data);
        setPlanoInfo(planoResponse.data);
      } catch (planoError) {
        console.error('Erro ao buscar detalhes do plano:', planoError);
      }
      
      // Usar a nova rota direta para buscar as sprints do aluno
      console.log('7. Buscando sprints do aluno diretamente...');
      try {
        const sprintsResponse = await api.get('/alunos/sprints');
        console.log('8. Sprints do aluno:', sprintsResponse.data);
        
        if (!sprintsResponse.data || sprintsResponse.data.length === 0) {
          setError('Não há sprints cadastradas no seu plano de estudo.');
          setLoading(false);
          return;
        }
        
        // Ordenar sprints por posição (se disponível) ou data de início
        const sortedSprints = [...sprintsResponse.data].sort((a, b) => {
          if (a.posicao !== undefined && b.posicao !== undefined) {
            return a.posicao - b.posicao;
          }
          return new Date(a.dataInicio) - new Date(b.dataInicio);
        });
        
        // Pegar a primeira sprint 
        const primeiraSprintId = sortedSprints[0].id;
        console.log('9. ID da primeira sprint:', primeiraSprintId);
        
        // Buscar detalhes da sprint
        await fetchSprintById(primeiraSprintId);
      } catch (sprintsError) {
        console.error('Erro ao buscar sprints do aluno:', sprintsError);
        if (sprintsError.response) {
          console.error('Resposta do servidor:', sprintsError.response.data);
          console.error('Status do erro:', sprintsError.response.status);
        }
        setError(`Erro ao carregar sua sprint: ${sprintsError.message || 'Erro desconhecido'}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro geral ao carregar sprint do aluno:', error);
      
      // Verificar se é um erro de autenticação
      if (error.response?.status === 401) {
        setError('Erro de autenticação. Por favor, faça login novamente.');
        setShowAuthDebug(true);
      } else {
        setError(`Erro ao carregar sua sprint: ${error.message || 'Erro desconhecido'}`);
      }
      setLoading(false);
    }
  };

  // Função para buscar uma sprint específica pelo ID
  const fetchSprintById = async (sprintId) => {
    try {
      console.log(`10. Buscando detalhes da sprint ${sprintId}...`);
      
      const response = await api.get(`/sprints/${sprintId}`);
      console.log('11. Detalhes da sprint recebida:', response.data);
      
      const sprintData = response.data;
      setSprint(sprintData);
      calculateStats(sprintData);
    } catch (error) {
      console.error(`Erro ao carregar detalhes da sprint ${sprintId}:`, error);
      if (error.response) {
        console.error('Resposta do servidor:', error.response.data);
        console.error('Status do erro:', error.response.status);
      }
      setError(`Erro ao carregar detalhes da sprint: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (currentSprint) => {
    if (!currentSprint || !currentSprint.metas) return;

    const totalMetas = currentSprint.metas.length;
    const completedMetas = currentSprint.metas.filter(m => m.status === 'Concluída').length;
    
    // Calcular horas totais
    const totalHours = currentSprint.metas.reduce((acc, curr) => {
      const [hours, minutes] = (curr.tempoEstudado || '00:00').split(':').map(Number);
      return acc + hours + (minutes / 60);
    }, 0);
    
    // Calcular desempenho como média dos desempenhos das metas
    const metasComDesempenho = currentSprint.metas.filter(m => 
      m.desempenho !== undefined && m.desempenho !== null && !isNaN(parseFloat(m.desempenho))
    );
    
    let desempenhoMedio = 0;
    if (metasComDesempenho.length > 0) {
      const somaDesempenhos = metasComDesempenho.reduce((acc, meta) => 
        acc + parseFloat(meta.desempenho), 0
      );
      desempenhoMedio = somaDesempenhos / metasComDesempenho.length;
    }
    
    // Calcular total de questões resolvidas (soma de totalQuestoes de todas as metas)
    const questionsSolved = currentSprint.metas.reduce((acc, meta) => 
      acc + (meta.totalQuestoes || 0), 0
    );
    
    // Calcular média diária
    const startDate = new Date(currentSprint.dataInicio);
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

  if (loading && !sprint) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.dashboard}>
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchAlunoPrimeiroSprint} className={styles.retryButton}>
            Tentar novamente
          </button>
        </div>
      )}
      
      {showAuthDebug && (
        <div className={styles.authDebug}>
          <h3>Diagnóstico de Autenticação</h3>
          <AuthCheck />
          <p className={styles.hint}>
            Se o token estiver ausente ou inválido, tente fazer <a href="/aluno/login">login novamente</a>
          </p>
        </div>
      )}
      
      {usuario && planoInfo && (
        <div className={styles.userPlanoInfo}>
          <h2 className={styles.userPlanoTitle}>
            Olá, {usuario.nome.split(' ')[0]} | {planoInfo.nome} - {planoInfo.cargo}
          </h2>
          <p className={styles.userPlanoDesc}>{planoInfo.descricao}</p>
        </div>
      )}
      
      <div className={styles.sprintRow}>
        <div className={styles.sprintContainer}>
          <SprintHeader 
            sprintTitle={sprint?.nome}
            progress={sprint ? (sprint.metas.filter(m => m.status === 'Concluída').length / sprint.metas.length) * 100 : 0}
            startDate={sprint?.dataInicio}
            disableSprintChange={true} // Desabilita a troca de sprint para alunos
          >
            <SprintStats stats={stats} />
          </SprintHeader>
        </div>
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