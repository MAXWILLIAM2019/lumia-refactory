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
  const [metasConcluidas, setMetasConcluidas] = useState(0);
  const [totalMetas, setTotalMetas] = useState(0);

  useEffect(() => {
    fetchUsuarioInfo();
    fetchAlunoPrimeiroSprint();
  }, []);

  const fetchUsuarioInfo = async () => {
    try {
      console.log('========== BUSCANDO INFORMAÇÕES DO USUÁRIO ==========');
      const response = await api.get('/auth/me');
      console.log('Dados do usuário recebidos:', response.data);
      
      if (response.data && response.data.aluno) {
        setUsuario(response.data.aluno);
        console.log('Informações do usuário atualizadas no estado');
        
        // Também buscar o plano, se o usuário estiver disponível
        await fetchAlunoPlano();
      } else {
        console.error('Estrutura inválida nos dados do usuário:', response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      if (error.response) {
        console.error('Resposta da API:', error.response.data);
        console.error('Status do erro:', error.response.status);
      }
    }
    console.log('========== FINALIZADO BUSCA DE INFORMAÇÕES DO USUÁRIO ==========');
  };

  // Função para buscar o plano do aluno logado
  const fetchAlunoPlano = async () => {
    try {
      console.log('========== BUSCANDO PLANO DO ALUNO LOGADO ==========');
      const planoResp = await api.get('/aluno-plano/meu-plano');
      console.log('Plano do aluno recebido:', planoResp.data);
      if (planoResp.data && planoResp.data.planoId) {
        setPlanoInfo(planoResp.data.plano);
        return planoResp.data.planoId;
      } else {
        setError('Você não possui planos de estudo atribuídos.');
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar plano do aluno logado:', error);
      setError('Erro ao buscar plano do aluno.');
      setLoading(false);
      return null;
    }
  };

  const fetchAlunoPrimeiroSprint = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('========== INICIANDO BUSCA DE SPRINT DO ALUNO ==========');
      // Buscar o plano do aluno logado
      const planoId = await fetchAlunoPlano();
      if (!planoId) return;
      // Buscar sprints do plano
      try {
        const sprintsResponse = await api.get(`/planos/${planoId}/sprints`);
        console.log('Sprints do plano recebidas:', sprintsResponse.data);
        if (!sprintsResponse.data || sprintsResponse.data.length === 0) {
          setError('Não há sprints cadastradas no seu plano de estudo.');
          setLoading(false);
          return;
        }
        // Ordenar sprints por posição ou data de início
        const sortedSprints = [...sprintsResponse.data].sort((a, b) => {
          if (a.posicao !== undefined && b.posicao !== undefined) {
            return a.posicao - b.posicao;
          }
          return new Date(a.dataInicio) - new Date(b.dataInicio);
        });
        // Pegar a primeira sprint
        const primeiraSprintId = sortedSprints[0].id;
        await fetchSprintById(primeiraSprintId);
      } catch (sprintsError) {
        console.error('Erro ao buscar sprints do plano:', sprintsError);
        setError('Erro ao buscar sprints do plano.');
        setLoading(false);
      }
      console.log('========== FINALIZADO PROCESSO DE BUSCA DE SPRINT ==========');
    } catch (error) {
      console.error('ERRO CRÍTICO não tratado:', error);
      setError(`Erro crítico: ${error.message || 'Erro desconhecido'}`);
      setLoading(false);
    }
  };

  // Função para contar metas concluídas
  const contarMetasConcluidas = (metas) => {
    if (!metas) return 0;
    return metas.filter(meta => meta.status === 'Concluída').length;
  };

  // Função para buscar uma sprint específica pelo ID
  const fetchSprintById = async (sprintId) => {
    try {
      console.log('========== BUSCANDO SPRINT POR ID ==========');
      console.log('ID da Sprint:', sprintId);
      
      const response = await api.get(`/sprints/${sprintId}`);
      console.log('Resposta da API:', response.data);
      
      if (response.data) {
        setSprint(response.data);
        // Atualizar contagem de metas
        setTotalMetas(response.data.metas.length);
        setMetasConcluidas(contarMetasConcluidas(response.data.metas));
        calculateStats(response.data);
        console.log('Sprint atualizada no estado com sucesso');
      } else {
        setError('Sprint não encontrada');
      }
    } catch (error) {
      console.error('Erro ao buscar sprint:', error);
      setError('Erro ao buscar sprint');
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
    
    // Filtrar apenas metas que:
    // 1. Foram concluídas
    // 2. Têm questões resolvidas (totalQuestoes > 0)
    // 3. Têm um desempenho válido
    const metasComDesempenho = currentSprint.metas.filter(m => 
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
    const questionsSolved = currentSprint.metas
      .filter(m => m.status === 'Concluída')
      .reduce((acc, meta) => acc + (meta.totalQuestoes || 0), 0);
    
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
        </div>
      )}
      
      <div className={styles.sprintRow}>
        <div className={styles.sprintContainer}>
          <SprintHeader 
            sprintTitle={sprint?.nome}
            progress={sprint ? (sprint.metas.filter(m => m.status === 'Concluída').length / sprint.metas.length) * 100 : 0}
            startDate={sprint?.dataInicio}
            disableSprintChange={true}
            sprints={[sprint].filter(Boolean)}
            selectedSprintId={sprint?.id}
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