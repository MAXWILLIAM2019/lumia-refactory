import React, { useState, useEffect } from 'react';
import styles from './Ranking.module.css';

/**
 * Componente Ranking
 * Página de ranking dos alunos com pódium e tabela de posições
 * 
 * Funcionalidades:
 * - Exibição do pódium (top 3)
 * - Tabela de ranking completa
 * - Timer de reinicialização semanal
 * - Indicadores de mudança de posição
 * - Avatares com iniciais dos alunos
 */
export default function Ranking() {
  const [rankingData, setRankingData] = useState({
    top3: [
      {
        position: 1,
        initials: 'AB',
        name: 'Ana B****** S**...',
        performance: 92,
        trophy: 'gold'
      },
      {
        position: 2,
        initials: 'JC',
        name: 'Juliana C******O',
        performance: 85,
        trophy: 'silver'
      },
      {
        position: 3,
        initials: 'LS',
        name: 'Lucas S*****Z',
        performance: 76,
        trophy: 'bronze'
      }
    ],
    list: [
      {
        position: 984,
        initials: 'MW',
        name: 'Você (Max William)',
        performance: 55,
        change: 'up'
      },
      {
        position: 4,
        initials: 'PM',
        name: 'Pedro ******** Moraes',
        performance: 75,
        change: 'up'
      },
      {
        position: 5,
        initials: 'VN',
        name: 'Vitória N*******0',
        performance: 70,
        change: 'up'
      },
      {
        position: 6,
        initials: 'AP',
        name: 'André **** p***s',
        performance: 67,
        change: 'down'
      }
    ]
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 10,
    hours: 23,
    minutes: 59,
    seconds: 29
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTrophyIcon = (trophy) => {
    switch (trophy) {
      case 'gold':
        return '🏆';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '🏆';
    }
  };

  const getChangeIcon = (change) => {
    return change === 'up' ? '▲' : '▼';
  };

  const getChangeColor = (change) => {
    return change === 'up' ? '#10b981' : '#ef4444';
  };

  return (
    <div className={styles.rankingContainer}>
      {/* Header com timer */}
      <div className={styles.header}>
        <div className={styles.timerContainer}>
          <span className={styles.hourglass}>⏳</span>
          <span className={styles.timerText}>
            O ranking semanal irá reiniciar em {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        </div>
      </div>

      {/* Pódium */}
      <div className={styles.podiumContainer}>
        <div className={styles.podium}>
          {/* 2º Lugar */}
          <div className={`${styles.podiumItem} ${styles.secondPlace}`}>
            <div className={styles.avatar}>{rankingData.top3[1].initials}</div>
            <div className={styles.trophy}>{getTrophyIcon(rankingData.top3[1].trophy)}</div>
            <div className={styles.position}>2º Lugar</div>
            <div className={styles.name}>{rankingData.top3[1].name}</div>
            <div className={styles.performance}>{rankingData.top3[1].performance}%</div>
          </div>

          {/* 1º Lugar */}
          <div className={`${styles.podiumItem} ${styles.firstPlace}`}>
            <div className={styles.avatar}>{rankingData.top3[0].initials}</div>
            <div className={styles.trophy}>{getTrophyIcon(rankingData.top3[0].trophy)}</div>
            <div className={styles.position}>1º Lugar</div>
            <div className={styles.name}>{rankingData.top3[0].name}</div>
            <div className={styles.performance}>{rankingData.top3[0].performance}%</div>
          </div>

          {/* 3º Lugar */}
          <div className={`${styles.podiumItem} ${styles.thirdPlace}`}>
            <div className={styles.avatar}>{rankingData.top3[2].initials}</div>
            <div className={styles.trophy}>{getTrophyIcon(rankingData.top3[2].trophy)}</div>
            <div className={styles.position}>3º Lugar</div>
            <div className={styles.name}>{rankingData.top3[2].name}</div>
            <div className={styles.performance}>{rankingData.top3[2].performance}%</div>
          </div>
        </div>
      </div>

      {/* Tabela de Ranking */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>
            Posição
            <span className={styles.sortIcon}>↕</span>
          </div>
          <div className={styles.headerCell}>
            Nome do aluno
            <span className={styles.sortIcon}>↕</span>
          </div>
          <div className={styles.headerCell}>Desempenho (%)</div>
        </div>

        <div className={styles.tableBody}>
          {rankingData.list.map((item, index) => (
            <div key={index} className={`${styles.tableRow} ${item.name.includes('Você') ? styles.userRow : ''}`}>
              <div className={styles.positionCell}>
                <span className={styles.positionNumber}>{item.position}</span>
                <span 
                  className={styles.changeIcon}
                  style={{ color: getChangeColor(item.change) }}
                >
                  {getChangeIcon(item.change)}
                </span>
              </div>
              <div className={styles.nameCell}>
                <div className={styles.userAvatar}>{item.initials}</div>
                <span className={styles.userName}>{item.name}</span>
              </div>
              <div className={styles.performanceCell}>{item.performance}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}