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
 */
export default function SprintHeader({ 
  children, 
  sprintTitle = 'Sprint 19', 
  progress = 0, 
  startDate,
  onSprintChange 
}) {
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSprints();
  }, []);

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
      </div>

      {/* Container de informações da sprint */}
      <div className={styles.sprintInfo}>
        <div className={styles.sprintProgressBlock}>
          {/* Bloco de progresso com barra e informações */}
          <div className={styles.sprintProgress}>
            <span className={styles.sprintTitle}>{sprintTitle}</span>
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBarBg}>
                <div 
                  className={styles.progressBarFill} 
                  style={{width: `${progress}%`}}
                />
              </div>
            </div>
            <span className={styles.sprintNumbers}>{Math.round(progress)}%</span>
            <span className={styles.sprintStart}>Iniciada: {formatDate(startDate)}</span>
          </div>
          {/* Componentes filhos (ex: estatísticas) */}
          {children}
        </div>
      </div>
    </div>
  );
} 