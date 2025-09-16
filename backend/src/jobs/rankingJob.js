const { QueryTypes } = require('sequelize');
const db = require('../db');

/**
 * Job para atualizar ranking semanal
 * Executa 3x ao dia: 08:00, 14:00, 20:00
 */
class RankingJob {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Executa a atualização do ranking
   */
  async executarAtualizacao() {
    if (this.isRunning) {
      console.log('⚠️  Job de ranking já está em execução, pulando...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('🔄 Iniciando atualização do ranking semanal...');

      // Chama a função PostgreSQL para atualizar ranking
      await db.query('SELECT public.atualizar_ranking_semanal()', {
        type: QueryTypes.SELECT
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Ranking atualizado com sucesso em ${duration}ms`);

      // Log de estatísticas
      await this.logEstatisticas();

    } catch (error) {
      console.error('❌ Erro ao atualizar ranking:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Executa limpeza de dados antigos
   * Executa toda segunda-feira às 02:00
   */
  async executarLimpeza() {
    try {
      console.log('🧹 Iniciando limpeza de ranking antigo...');

      // Chama a função PostgreSQL para limpeza
      await db.query('SELECT public.limpar_ranking_antigo()', {
        type: QueryTypes.SELECT
      });

      console.log('✅ Limpeza de ranking antigo concluída');

    } catch (error) {
      console.error('❌ Erro ao limpar ranking antigo:', error);
      throw error;
    }
  }

  /**
   * Log de estatísticas do ranking
   */
  async logEstatisticas() {
    try {
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total_alunos,
          AVG(pontuacao_final) as pontuacao_media,
          MAX(pontuacao_final) as pontuacao_maxima,
          MIN(pontuacao_final) as pontuacao_minima,
          SUM(total_questoes) as total_questoes_semana,
          SUM(total_acertos) as total_acertos_semana
        FROM public.ranking_semanal_simples 
        WHERE semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
      `, {
        type: QueryTypes.SELECT
      });

      if (stats.length > 0) {
        const stat = stats[0];
        console.log('📊 Estatísticas do ranking:');
        console.log(`   • Total de alunos: ${stat.total_alunos}`);
        console.log(`   • Pontuação média: ${parseFloat(stat.pontuacao_media).toFixed(2)}`);
        console.log(`   • Pontuação máxima: ${parseFloat(stat.pontuacao_maxima).toFixed(2)}`);
        console.log(`   • Total de questões: ${stat.total_questoes_semana}`);
        console.log(`   • Total de acertos: ${stat.total_acertos_semana}`);
      }

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
    }
  }

  /**
   * Obtém ranking atual
   */
  async obterRankingAtual(limite = 50) {
    try {
      const ranking = await db.query(`
        SELECT 
          posicao,
          nome_usuario,
          total_questoes,
          total_acertos,
          percentual_acerto,
          pontuacao_final,
          ultima_atualizacao
        FROM public.ranking_semanal_simples 
        WHERE semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
        ORDER BY posicao ASC
        LIMIT :limite
      `, {
        replacements: { limite },
        type: QueryTypes.SELECT
      });

      return ranking;

    } catch (error) {
      console.error('❌ Erro ao obter ranking:', error);
      throw error;
    }
  }

  /**
   * Obtém posição de um usuário específico
   */
  async obterPosicaoUsuario(idUsuario) {
    try {
      const posicao = await db.query(`
        SELECT 
          posicao,
          nome_usuario,
          total_questoes,
          total_acertos,
          percentual_acerto,
          pontuacao_final,
          ultima_atualizacao
        FROM public.ranking_semanal_simples 
        WHERE id_usuario = :idUsuario 
        AND semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
      `, {
        replacements: { idUsuario },
        type: QueryTypes.SELECT
      });

      return posicao.length > 0 ? posicao[0] : null;

    } catch (error) {
      console.error('❌ Erro ao obter posição do usuário:', error);
      throw error;
    }
  }
}

module.exports = new RankingJob();

