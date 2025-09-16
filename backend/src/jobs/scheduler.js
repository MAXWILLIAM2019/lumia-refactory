const cron = require('node-cron');
const rankingJob = require('./rankingJob');

/**
 * Agendador de jobs para o sistema de ranking
 */
class JobScheduler {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  /**
   * Inicia todos os jobs agendados
   */
  iniciar() {
    if (this.isRunning) {
      console.log('⚠️  Scheduler já está em execução');
      return;
    }

    console.log('🚀 Iniciando agendador de jobs...');

    // Job 1: Atualização do ranking 3x ao dia
    // 08:00, 14:00, 20:00
    const rankingJob1 = cron.schedule('0 8 * * *', async () => {
      console.log('⏰ Executando job de ranking (08:00)...');
      await rankingJob.executarAtualizacao();
    }, {
      scheduled: false,
      timezone: 'America/Sao_Paulo'
    });

    const rankingJob2 = cron.schedule('0 14 * * *', async () => {
      console.log('⏰ Executando job de ranking (14:00)...');
      await rankingJob.executarAtualizacao();
    }, {
      scheduled: false,
      timezone: 'America/Sao_Paulo'
    });

    const rankingJob3 = cron.schedule('0 20 * * *', async () => {
      console.log('⏰ Executando job de ranking (20:00)...');
      await rankingJob.executarAtualizacao();
    }, {
      scheduled: false,
      timezone: 'America/Sao_Paulo'
    });

    // Job 2: Limpeza semanal (segunda-feira às 02:00)
    const limpezaJob = cron.schedule('0 2 * * 1', async () => {
      console.log('⏰ Executando limpeza semanal (segunda 02:00)...');
      await rankingJob.executarLimpeza();
    }, {
      scheduled: false,
      timezone: 'America/Sao_Paulo'
    });

    // Armazena referências dos jobs
    this.jobs = [rankingJob1, rankingJob2, rankingJob3, limpezaJob];

    // Inicia todos os jobs
    this.jobs.forEach(job => job.start());

    this.isRunning = true;

    console.log('✅ Agendador iniciado com sucesso!');
    console.log('📅 Jobs agendados:');
    console.log('   • Ranking: 08:00, 14:00, 20:00 (diário)');
    console.log('   • Limpeza: 02:00 (segundas-feiras)');
  }

  /**
   * Para todos os jobs
   */
  parar() {
    if (!this.isRunning) {
      console.log('⚠️  Scheduler não está em execução');
      return;
    }

    console.log('🛑 Parando agendador de jobs...');

    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    this.isRunning = false;

    console.log('✅ Agendador parado com sucesso!');
  }

  /**
   * Executa job de ranking manualmente (para testes)
   */
  async executarRankingManual() {
    console.log('🔧 Executando job de ranking manualmente...');
    await rankingJob.executarAtualizacao();
  }

  /**
   * Executa limpeza manualmente (para testes)
   */
  async executarLimpezaManual() {
    console.log('🔧 Executando limpeza manualmente...');
    await rankingJob.executarLimpeza();
  }

  /**
   * Obtém status dos jobs
   */
  obterStatus() {
    return {
      isRunning: this.isRunning,
      totalJobs: this.jobs.length,
      jobs: this.jobs.map((job, index) => ({
        id: index,
        running: job.running,
        scheduled: job.scheduled
      }))
    };
  }
}

module.exports = new JobScheduler();

