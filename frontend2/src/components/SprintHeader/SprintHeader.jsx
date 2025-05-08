import styles from './SprintHeader.module.css';

/**
 * Componente SprintHeader
 * Exibe o cabeçalho da sprint com título, progresso e estatísticas
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes filhos (ex: SprintStats)
 * @param {string} props.sprintTitle - Título da sprint (ex: "Sprint 19")
 * @param {number} props.progress - Progresso da sprint (ex: 75)
 * @param {string} props.startDate - Data de início da sprint (ex: "2023-05-01")
 */
export default function SprintHeader({ children, sprintTitle = 'Sprint 19', progress = 0, startDate }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.header}>
      {/* Título principal do cabeçalho */}
      <h2 className={styles.sprintTitleHeader}>
        Acompanhe seu progresso e veja o que falta para atingir sua sprint
      </h2>

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