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

    // Job 1: Atualização do ranking a cada 10 segundos (desenvolvimento)
    const rankingJobSchedule = cron.schedule('*/10 * * * * *', async () => {
      await rankingJob.executarAtualizacao();
    }, {
      scheduled: false,
      timezone: 'America/Sao_Paulo'
    });

    // Job 2: Limpeza semanal (segunda-feira às 02:00)
    const limpezaJob = cron.schedule('0 2 * * 1', async () => {
      await rankingJob.executarLimpeza();
    }, {
      scheduled: false,
      timezone: 'America/Sao_Paulo'
    });

    // Armazena referências dos jobs
    this.jobs = [rankingJobSchedule, limpezaJob];

    // Inicia todos os jobs
    this.jobs.forEach(job => job.start());

    this.isRunning = true;

    console.log('✅ Agendador iniciado com sucesso!');
    console.log('📅 Jobs agendados:');
    console.log('   • Ranking: a cada 10 segundos (desenvolvimento)');
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

