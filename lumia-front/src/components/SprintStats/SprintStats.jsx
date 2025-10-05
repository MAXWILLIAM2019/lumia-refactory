import styles from './SprintStats.module.css';

export default function SprintStats({ stats }) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statBoxBlue}>
        <span>Seu desempenho</span>
        <strong>{stats.performance}</strong>
      </div>
      <div className={styles.statBoxPurple}>
        <span>Horas estudadas</span>
        <strong>{stats.hoursStudied}</strong>
      </div>
      <div className={styles.statBoxGreen}>
        <span>Questões resolvidas</span>
        <strong>{stats.questionsSolved}</strong>
      </div>
      <div className={styles.statBoxOrange}>
        <span>Média de horas diárias</span>
        <strong>{stats.dailyAvg}</strong>
      </div>
    </div>
  );
} 