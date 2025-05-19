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
      console.log('========== BUSCANDO INFORMAÇÕES DO USUÁRIO ==========');
      const response = await api.get('/auth/me');
      console.log('Dados do usuário recebidos:', response.data);
      
      if (response.data && response.data.aluno) {
        setUsuario(response.data.aluno);
        console.log('Informações do usuário atualizadas no estado');
        
        // Também buscar o plano, se o usuário estiver disponível
        await fetchAlunoPlano(response.data.aluno.id);
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

  // Função para buscar o plano do aluno
  const fetchAlunoPlano = async (alunoId) => {
    try {
      console.log('========== BUSCANDO PLANO DO ALUNO ==========');
      const planosResponse = await api.get('/alunos/planos');
      console.log('Planos do aluno recebidos:', planosResponse.data);
      
      if (planosResponse.data && planosResponse.data.length > 0) {
        const planoId = planosResponse.data[0].planoId;
        console.log('ID do plano encontrado:', planoId);
        
        const planoResponse = await api.get(`/planos/${planoId}`);
        console.log('Detalhes do plano recebidos:', planoResponse.data);
        setPlanoInfo(planoResponse.data);
        console.log('Informações do plano atualizadas no estado');
      } else {
        console.log('Nenhum plano encontrado para o aluno');
      }
    } catch (error) {
      console.error('Erro ao buscar plano do aluno:', error);
    }
    console.log('========== FINALIZADO BUSCA DE PLANO ==========');
  };

  const fetchAlunoPrimeiroSprint = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('========== INICIANDO BUSCA DE SPRINT DO ALUNO ==========');
      console.log('1. Buscando sprints do aluno...');
      
      // Buscar informações do usuário, se ainda não tiver
      if (!usuario) {
        console.log('2. Buscando informações do usuário...');
        await fetchUsuarioInfo();
      } else {
        console.log('2. Usuário já disponível:', usuario.nome);
      }
      
      // Buscar informações do plano
      try {
        console.log('3. Buscando planos do aluno...');
        const planosResponse = await api.get('/alunos/planos');
        console.log('4. Resposta da API (planos):', planosResponse.data);
        
        if (!planosResponse.data || planosResponse.data.length === 0) {
          console.log('5. ERRO: Nenhum plano encontrado para o aluno');
          setError('Você não possui planos de estudo atribuídos.');
          setLoading(false);
          return;
        }
        
        // Pegar o primeiro plano
        const planoId = planosResponse.data[0].planoId;
        console.log('5. ID do primeiro plano:', planoId);
        
        // Buscar informações detalhadas do plano
        console.log('6. Buscando informações detalhadas do plano...');
        try {
          const planoResponse = await api.get(`/planos/${planoId}`);
          console.log('7. Detalhes do plano:', planoResponse.data);
          setPlanoInfo(planoResponse.data);
        } catch (planoError) {
          console.error('7. ERRO ao buscar detalhes do plano:', planoError);
          console.error('Resposta da API:', planoError.response?.data);
          console.error('Status do erro:', planoError.response?.status);
        }
        
        // Usar a nova rota direta para buscar as sprints do aluno
        console.log('8. Buscando sprints do aluno diretamente...');
        try {
          console.log('Chamando endpoint /alunos/sprints');
          const sprintsResponse = await api.get('/alunos/sprints');
          console.log('9. Resposta da API (sprints):', sprintsResponse.data);
          
          if (!sprintsResponse.data || sprintsResponse.data.length === 0) {
            console.log('10. ERRO: Nenhuma sprint encontrada no plano');
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
          console.log('11. ID da primeira sprint:', primeiraSprintId);
          console.log('Quantidade de metas na primeira sprint:', sortedSprints[0].metas?.length || 0);
          
          // Buscar detalhes da sprint
          await fetchSprintById(primeiraSprintId);
        } catch (sprintsError) {
          console.error('9. ERRO ao buscar sprints do aluno:', sprintsError);
          if (sprintsError.response) {
            console.error('Resposta da API:', sprintsError.response.data);
            console.error('Status do erro:', sprintsError.response.status);
          }
          
          // Como fallback, tentar buscar sprints pelo ID do plano
          console.log('10. Tentando alternativa: buscar sprints pelo ID do plano...');
          try {
            const fallbackResponse = await api.get(`/planos/${planoId}/sprints`);
            console.log('11. Resposta da API (fallback):', fallbackResponse.data);
            
            if (!fallbackResponse.data || fallbackResponse.data.length === 0) {
              console.log('12. ERRO: Nenhuma sprint encontrada no fallback');
              setError('Não há sprints cadastradas no seu plano de estudo.');
              setLoading(false);
              return;
            }
            
            // Ordenar sprints
            const sortedSprints = [...fallbackResponse.data].sort((a, b) => {
              if (a.posicao !== undefined && b.posicao !== undefined) {
                return a.posicao - b.posicao;
              }
              return new Date(a.dataInicio) - new Date(b.dataInicio);
            });
            
            // Pegar a primeira sprint
            const primeiraSprintId = sortedSprints[0].id;
            console.log('13. ID da primeira sprint (fallback):', primeiraSprintId);
            
            // Buscar detalhes da sprint
            await fetchSprintById(primeiraSprintId);
          } catch (fallbackError) {
            console.error('11. ERRO também no fallback:', fallbackError);
            setError(`Erro ao carregar sua sprint: ${sprintsError.message || 'Erro desconhecido'}`);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('ERRO geral ao carregar sprint do aluno:', error);
        
        // Verificar se é um erro de autenticação
        if (error.response?.status === 401) {
          console.error('Erro de autenticação (401)');
          setError('Erro de autenticação. Por favor, faça login novamente.');
          setShowAuthDebug(true);
        } else {
          setError(`Erro ao carregar sua sprint: ${error.message || 'Erro desconhecido'}`);
        }
        setLoading(false);
      }
      console.log('========== FINALIZADO PROCESSO DE BUSCA DE SPRINT ==========');
    } catch (error) {
      console.error('ERRO CRÍTICO não tratado:', error);
      setError(`Erro crítico: ${error.message || 'Erro desconhecido'}`);
      setLoading(false);
    }
  };

  // Função para buscar uma sprint específica pelo ID
  const fetchSprintById = async (sprintId) => {
    try {
      console.log(`========== BUSCANDO DETALHES DA SPRINT ${sprintId} ==========`);
      
      const response = await api.get(`/sprints/${sprintId}`);
      console.log('Detalhes da sprint recebida:', response.data);
      console.log('Quantidade de metas na sprint:', response.data.metas?.length || 0);
      
      const sprintData = response.data;
      setSprint(sprintData);
      calculateStats(sprintData);
      console.log('Sprint atualizada no estado com sucesso');
    } catch (error) {
      console.error(`ERRO ao carregar detalhes da sprint ${sprintId}:`, error);
      if (error.response) {
        console.error('Resposta da API:', error.response.data);
        console.error('Status do erro:', error.response.status);
      }
      setError(`Erro ao carregar detalhes da sprint: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
      console.log(`========== FINALIZADA BUSCA DE DETALHES DA SPRINT ${sprintId} ==========`);
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