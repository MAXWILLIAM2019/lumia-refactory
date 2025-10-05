import React, { useState, useEffect } from 'react';
import styles from './Ranking.module.css';
import rankingService from '../../services/rankingService';

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
  // Estados para dados do ranking
  const [rankingData, setRankingData] = useState({
    top3: [],
    list: []
  });
  
  // Estados para controle da aplicação
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Formata o texto do timer
  const timerText = `Próximo reset: ${timeLeft.days || 0}d ${timeLeft.hours || 0}h ${timeLeft.minutes || 0}m ${timeLeft.seconds || 0}s`;

  // Carrega dados do ranking
  useEffect(() => {
    carregarRanking();
  }, []);

  // Timer para contagem regressiva
  useEffect(() => {
    // Inicializa o timer
    const tempoInicial = rankingService.calcularTempoRestante();
    setTimeLeft(tempoInicial);

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

  /**
   * Carrega dados do ranking da API
   */
  const carregarRanking = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carrega ranking geral e posição do usuário em paralelo
      const [rankingResult, meuRankingResult] = await Promise.all([
        rankingService.obterRanking(50, 1),
        rankingService.obterMeuRanking()
      ]);

      if (rankingResult.success) {
        
        const dadosFormatados = rankingService.formatarDadosRanking(
          rankingResult.data.data.ranking,
          meuRankingResult.success && meuRankingResult.data && meuRankingResult.data.data ? meuRankingResult.data.data.posicao : null
        );
        
        setRankingData(dadosFormatados);
      } else {
        setError(rankingResult.error);
      }

    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
      setError('Erro ao carregar dados do ranking');
    } finally {
      setLoading(false);
    }
  };

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

  // Estados de loading e erro
  if (loading) {
    return (
      <div className={styles.rankingContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Carregando ranking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.rankingContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>Erro ao carregar ranking</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={carregarRanking}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.rankingContainer}>
      {/* Header com timer */}
      <div className={styles.header}>
        <div className={styles.timerContainer}>
          <span className={styles.hourglass}>⏳</span>
          <span className={styles.timerText}>
            {timerText}
          </span>
        </div>
      </div>

      {/* Pódium */}
      <div className={styles.podiumContainer}>
        <div className={styles.podium}>
          {/* 2º Lugar */}
          {rankingData.top3[1] && (
            <div className={`${styles.podiumItem} ${styles.secondPlace}`}>
              <div className={styles.avatar}>{rankingData.top3[1].initials}</div>
              <div className={styles.trophy}>{getTrophyIcon(rankingData.top3[1].trophy)}</div>
              <div className={styles.position}>2º Lugar</div>
              <div className={styles.name}>{rankingData.top3[1].name}</div>
              <div className={styles.performance}>{rankingData.top3[1].performance}%</div>
            </div>
          )}

          {/* 1º Lugar */}
          {rankingData.top3[0] && (
            <div className={`${styles.podiumItem} ${styles.firstPlace}`}>
              <div className={styles.avatar}>{rankingData.top3[0].initials}</div>
              <div className={styles.trophy}>{getTrophyIcon(rankingData.top3[0].trophy)}</div>
              <div className={styles.position}>1º Lugar</div>
              <div className={styles.name}>{rankingData.top3[0].name}</div>
              <div className={styles.performance}>{rankingData.top3[0].performance}%</div>
            </div>
          )}

          {/* 3º Lugar */}
          {rankingData.top3[2] && (
            <div className={`${styles.podiumItem} ${styles.thirdPlace}`}>
              <div className={styles.avatar}>{rankingData.top3[2].initials}</div>
              <div className={styles.trophy}>{getTrophyIcon(rankingData.top3[2].trophy)}</div>
              <div className={styles.position}>3º Lugar</div>
              <div className={styles.name}>{rankingData.top3[2].name}</div>
              <div className={styles.performance}>{rankingData.top3[2].performance}%</div>
            </div>
          )}
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
          <div className={styles.headerCell}>Questões</div>
          <div className={styles.headerCell}>Desempenho (%)</div>
        </div>

        <div className={styles.tableBody}>
          {rankingData.list.length > 0 ? (
            rankingData.list.map((item, index) => (
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
                <div className={styles.questionsCell}>{item.totalQuestions}</div>
                <div className={styles.performanceCell}>{item.performance}%</div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>Nenhum dado de ranking disponível no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}