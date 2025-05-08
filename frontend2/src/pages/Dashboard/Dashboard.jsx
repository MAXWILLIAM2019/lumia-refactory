import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import SprintHeader from '../../components/SprintHeader/SprintHeader';
import SprintStats from '../../components/SprintStats/SprintStats';
import ActivitiesTable from '../../components/ActivitiesTable/ActivitiesTable';
import styles from './Dashboard.module.css';

/**
 * Componente Dashboard
 * Página principal que exibe a sprint atual e suas atividades
 */
export default function Dashboard() {
  const [sprint, setSprint] = useState(null);
  const [nextSprint, setNextSprint] = useState(null);
  const [loading, setLoading] = useState(true);
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
      const response = await fetch('http://localhost:3000/api/sprints');
      if (!response.ok) {
        throw new Error('Erro ao buscar sprints');
      }
      const data = await response.json();
      
      // Ordenar sprints por data de início
      const sortedSprints = data.sort((a, b) => 
        new Date(b.dataInicio) - new Date(a.dataInicio)
      );

      if (sortedSprints.length > 0) {
        setSprint(sortedSprints[0]);
        if (sortedSprints.length > 1) {
          setNextSprint(sortedSprints[1]);
        }
        calculateStats(sortedSprints[0]);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao carregar sprints');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (currentSprint) => {
    if (!currentSprint || !currentSprint.atividades) return;

    const totalActivities = currentSprint.atividades.length;
    const completedActivities = currentSprint.atividades.filter(a => a.status === 'Concluída').length;
    const totalHours = currentSprint.atividades.reduce((acc, curr) => {
      const [hours, minutes] = (curr.tempoEstudado || '00:00').split(':').map(Number);
      return acc + hours + (minutes / 60);
    }, 0);
    const questionsSolved = currentSprint.atividades.filter(a => a.tipo === 'exercicio' && a.status === 'Concluída').length;
    
    // Calcular média diária
    const startDate = new Date(currentSprint.dataInicio);
    const today = new Date();
    const daysDiff = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    const dailyAvg = totalHours / daysDiff;

    setStats({
      performance: `${((completedActivities / totalActivities) * 100).toFixed(2)}%`,
      hoursStudied: `${Math.floor(totalHours)}h${Math.round((totalHours % 1) * 60)}m`,
      questionsSolved,
      dailyAvg: `${Math.floor(dailyAvg)}h${Math.round((dailyAvg % 1) * 60)}m`
    });
  };

  const formatActivities = (atividades) => {
    if (!atividades) return [];
    return atividades.map(atividade => ({
      disciplina: atividade.disciplina,
      tipo: atividade.tipo,
      titulo: atividade.titulo,
      relevancia: '★'.repeat(atividade.relevancia),
      tempo: atividade.tempoEstudado || '--:--',
      desempenho: atividade.desempenho ? `${atividade.desempenho}%` : '--',
      status: atividade.status || 'Pendente',
      codigo: atividade.id
    }));
  };

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.sprintRow}>
          <div className={styles.sprintContainer}>
            <SprintHeader 
              sprintTitle={sprint?.nome}
              progress={sprint ? (sprint.atividades.filter(a => a.status === 'Concluída').length / sprint.atividades.length) * 100 : 0}
              startDate={sprint?.dataInicio}
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
        <div className={styles.activitiesContainer}>
          {sprint && (
            <ActivitiesTable 
              activities={formatActivities(sprint.atividades)}
              onFilterChange={(filter) => {
                // Implementar filtro
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
} 