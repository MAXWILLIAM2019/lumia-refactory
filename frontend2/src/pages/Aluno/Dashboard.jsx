import { useState, useEffect } from 'react';
import SprintHeader from '../../components/SprintHeader/SprintHeader';
import SprintStats from '../../components/SprintStats/SprintStats';
import ActivitiesTable from '../../components/ActivitiesTable/ActivitiesTable';
import AuthCheck from '../../components/AuthCheck/AuthCheck';
import styles from '../../pages/Dashboard/Dashboard.module.css';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

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
  const [proximaSprint, setProximaSprint] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarioInfo();
    fetchSprintAtual();
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

  const fetchSprintAtual = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('========== BUSCANDO SPRINT ATUAL ==========');
      
      const response = await api.get('/sprint-atual');
      console.log('Sprint atual recebida:', response.data);
      
      if (response.data) {
        const sprintData = response.data;
        setSprint(sprintData);
        setTotalMetas(sprintData.metas?.length || 0);
        setMetasConcluidas(contarMetasConcluidas(sprintData.metas || []));
        calculateStats(sprintData);
      } else {
        setError('Não foi possível carregar a sprint atual');
      }
    } catch (error) {
      console.error('Erro ao buscar sprint atual:', error);
      setError('Erro ao carregar sprint atual. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para contar metas concluídas
  const contarMetasConcluidas = (metas) => {
    if (!metas) return 0;
    return metas.filter(meta => meta.status === 'Concluída').length;
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

  // Função para buscar a próxima sprint
  const buscarProximaSprint = async () => {
    if (!sprint || !sprint.PlanoId) return;

    try {
      const response = await api.get(`/planos/${sprint.PlanoId}/sprints`);
      const sprints = response.data.sort((a, b) => a.posicao - b.posicao);
      const indexAtual = sprints.findIndex(s => s.id === sprint.id);
      
      if (indexAtual !== -1 && indexAtual < sprints.length - 1) {
        setProximaSprint(sprints[indexAtual + 1]);
      } else {
        setProximaSprint(null);
      }
    } catch (error) {
      console.error('Erro ao buscar próxima sprint:', error);
    }
  };

  // Função para ir para a próxima sprint
  const irParaProximaSprint = async () => {
    if (!proximaSprint) return;
    
    try {
      setLoading(true);
      // Atualizar a sprint atual no backend
      await api.put('/sprint-atual', { sprintId: proximaSprint.id });
      // Atualizar a sprint atual no frontend
      await fetchSprintAtual();
      // Buscar a próxima sprint
      await buscarProximaSprint();
    } catch (error) {
      console.error('Erro ao navegar para próxima sprint:', error);
      setError('Erro ao navegar para próxima sprint. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar próxima sprint quando a sprint atual mudar
  useEffect(() => {
    if (sprint) {
      buscarProximaSprint();
    }
  }, [sprint]);

  if (loading && !sprint) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.dashboard}>
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchSprintAtual} className={styles.retryButton}>
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
      
      {usuario && planoInfo && (
        <div className={styles.userPlanoInfo}>
          <h2 className={styles.userPlanoTitle}>
            Olá, {usuario.nome.split(' ')[0]} | {planoInfo.nome} - {planoInfo.cargo}
          </h2>
        </div>
      )}
      
      <div className={styles.sprintRow}>
        <div className={styles.sprintContainer}>
          {sprint && metasConcluidas === totalMetas && totalMetas > 0 && (
            <div className={styles.nextSprintContainer}>
              {proximaSprint ? (
                <button 
                  className={styles.nextSprintButton}
                  onClick={irParaProximaSprint}
                >
                  Próxima Sprint
                </button>
              ) : (
                <div className={styles.finishedMessage}>
                  Finalizado
                </div>
              )}
            </div>
          )}
          <SprintHeader 
            sprintTitle={sprint?.nome}
            progress={sprint ? (metasConcluidas / totalMetas) * 100 : 0}
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
                fetchSprintAtual();
              }
            }}
          />
        )}
      </div>
      {loading && <div className={styles.loadingOverlay}>Carregando metas...</div>}
    </div>
  );
} 