import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServicoRanking } from '../services/servicoRanking';

/**
 * Job para atualização do ranking semanal
 * 
 * Executa automaticamente:
 * - 3x ao dia: 08:00, 14:00, 20:00 (atualização do ranking)
 * - Toda segunda-feira às 02:00 (limpeza de dados antigos)
 */
@Injectable()
export class RankingJob {
  private readonly logger = new Logger(RankingJob.name);
  private isRunning = false;

  constructor(private readonly servicoRanking: ServicoRanking) {}

  /**
   * Atualiza o ranking semanal
   * Executa 3x ao dia: 08:00, 14:00, 20:00
   */
  @Cron('0 8,14,20 * * *', {
    name: 'atualizar-ranking',
    timeZone: 'America/Sao_Paulo',
  })
  async executarAtualizacaoRanking(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('⚠️  Job de ranking já está em execução, pulando...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      this.logger.log('🔄 Iniciando atualização do ranking semanal...');
      
      await this.servicoRanking.executarAtualizacaoRanking();
      
      const duration = Date.now() - startTime;
      this.logger.log(`✅ Ranking atualizado com sucesso em ${duration}ms`);
    } catch (error) {
      this.logger.error('❌ Erro ao atualizar ranking:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Limpa dados antigos do ranking
   * Executa toda segunda-feira às 02:00
   */
  @Cron('0 2 * * 1', {
    name: 'limpar-ranking-antigo',
    timeZone: 'America/Sao_Paulo',
  })
  async executarLimpezaRanking(): Promise<void> {
    try {
      this.logger.log('🧹 Iniciando limpeza de ranking antigo...');
      
      await this.servicoRanking.executarLimpezaRanking();
      
      this.logger.log('✅ Limpeza de ranking antigo concluída');
    } catch (error) {
      this.logger.error('❌ Erro ao limpar ranking antigo:', error);
    }
  }

  /**
   * Método manual para executar atualização (para testes)
   */
  async executarAtualizacaoManual(): Promise<void> {
    this.logger.log('🔄 Executando atualização manual do ranking...');
    await this.executarAtualizacaoRanking();
  }

  /**
   * Método manual para executar limpeza (para testes)
   */
  async executarLimpezaManual(): Promise<void> {
    this.logger.log('🧹 Executando limpeza manual do ranking...');
    await this.executarLimpezaRanking();
  }
}
