import { useState, useEffect } from 'react';
import styles from './SprintHeader.module.css';
import api from '../../services/api';

/**
 * Componente SprintHeader
 * Exibe o cabeçalho da sprint com título, progresso e estatísticas
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes filhos (ex: SprintStats)
 * @param {string} props.sprintTitle - Título da sprint (ex: "Sprint 19")
 * @param {number} props.progress - Progresso da sprint (ex: 75)
 * @param {string} props.startDate - Data de início da sprint (ex: "2023-05-01")
 * @param {Function} props.onSprintChange - Função chamada quando uma sprint é selecionada
 * @param {boolean} props.disableSprintChange - Se verdadeiro, desabilita a seleção de sprint
 */
export default function SprintHeader({ 
  children, 
  sprintTitle = 'Sprint 19', 
  progress = 0, 
  startDate,
  onSprintChange,
  disableSprintChange = false
}) {
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sprintData, setSprintData] = useState(null);
  // Estado local para armazenar o contador de atividades concluídas
  const [completedActivities, setCompletedActivities] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const [uniqueDisciplines, setUniqueDisciplines] = useState(0);

  useEffect(() => {
    fetchSprints();
  }, []);

  // Efeito para atualizar os contadores quando o progresso muda
  useEffect(() => {
    // Se a sprint foi buscada, atualizar os contadores
    if (sprintData?.metas) {
      const completed = sprintData.metas.filter(m => m.status === 'Concluída').length;
      const total = sprintData.metas.length;
      const disciplines = [...new Set(sprintData.metas.map(m => m.disciplina))].length;
      
      setCompletedActivities(completed);
      setTotalActivities(total);
      setUniqueDisciplines(disciplines);
    }
  }, [sprintData]);

  // Efeito para recalcular sprintData quando o progresso muda
  useEffect(() => {
    if (selectedSprintId) {
      fetchSprintData(selectedSprintId);
    }
  }, [progress, selectedSprintId]);

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sprints');
      setSprints(response.data);
    } catch (error) {
      console.error('Erro ao buscar sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSprintData = async (id) => {
    try {
      const response = await api.get(`/sprints/${id}`);
      setSprintData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados da sprint:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleSprintChange = (e) => {
    const sprintId = e.target.value;
    setSelectedSprintId(sprintId);
    if (onSprintChange) {
      onSprintChange(sprintId);
    }
  };

  return (
    <div className={styles.header}>
      {/* Título principal do cabeçalho com seletor de sprint */}
      <div className={styles.headerTitleRow}>
        <h2 className={styles.sprintTitleHeader}>
          Acompanhe seu progresso e veja o que falta para atingir sua sprint
        </h2>
        
        {!disableSprintChange && (
          <div className={styles.sprintSelector}>
            <select 
              onChange={handleSprintChange}
              disabled={loading}
              className={styles.sprintSelect}
            >
              <option value="">Selecione uma sprint</option>
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Container de informações da sprint */}
      <div className={styles.sprintInfo}>
        <div className={styles.sprintProgressBlock}>
          {/* Bloco de progresso com barra e informações */}
          <div className={styles.metaAtual}>
            <div className={styles.metaHeader}>
              <span className={styles.metaHeaderTitle}>Sprint Atual</span>
            </div>
            <div className={styles.sprintMetaContainer}>
              <div className={styles.metaTitle}>{sprintTitle}</div>
              <div className={styles.progressCounter}>
                <span className={styles.completedCount}>✔️ {completedActivities} Metas Concluídas</span>
                <span className={styles.totalIndicator}>{totalActivities > 0 ? Math.round(progress) : 0}%</span>
              </div>
              <div className={styles.progressBarWrapper}>
                <div className={styles.progressBarBg}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{width: `${progress}%`}}
                  />
                </div>
              </div>
              <div className={styles.metaFooter}>
                <div className={styles.sprintDetails}>
                  <span>{uniqueDisciplines} Disciplinas</span>
                  <span>{totalActivities} Atividades</span>
                </div>
                <div className={styles.sprintStart}>Iniciada: {formatDate(startDate)}</div>
              </div>
            </div>
          </div>
          {/* Componentes filhos (ex: estatísticas) */}
          {children}
        </div>
      </div>
    </div>
  );
} 