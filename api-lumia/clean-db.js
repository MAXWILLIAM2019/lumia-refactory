const { createConnection } = require('typeorm');
const { Usuario, GrupoUsuario, AlunoInfo, AdministradorInfo, PlanoMestre, Plano, AlunoPlanos, PlanoMestreDisciplina, SprintMestre, Sprint, MetaMestre, Meta, Disciplina, Assunto, SprintAtual, RankingSemanal } = require('./dist/entities');

async function cleanOrphanedData() {
  console.log('🧹 Iniciando limpeza de dados órfãos...');

  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '1127',
    database: process.env.DB_DATABASE || 'mentoring',
    entities: [Usuario, GrupoUsuario, AlunoInfo, AdministradorInfo, PlanoMestre, Plano, AlunoPlanos, PlanoMestreDisciplina, SprintMestre, Sprint, MetaMestre, Meta, Disciplina, Assunto, SprintAtual, RankingSemanal],
    synchronize: false,
    logging: false,
  });

  try {
    // 1. Remover metas órfãs
    console.log('🗑️ Removendo metas órfãs...');
    const metasOrfaResult = await connection
      .createQueryBuilder()
      .delete()
      .from(Meta)
      .where('sprint_id NOT IN (SELECT id FROM "Sprints")')
      .execute();
    console.log(`✅ Removidas ${metasOrfaResult.affected} metas órfãs`);

    // 2. Remover sprints órfãs
    console.log('🗑️ Removendo sprints órfãs...');
    const sprintsOrfaResult = await connection
      .createQueryBuilder()
      .delete()
      .from(Sprint)
      .where('plano_id NOT IN (SELECT id FROM "Plano")')
      .execute();
    console.log(`✅ Removidas ${sprintsOrfaResult.affected} sprints órfãs`);

    // 3. Remover associações aluno-plano órfãs
    console.log('🗑️ Removendo associações aluno-plano órfãs...');
    const alunoPlanoOrfaResult = await connection
      .createQueryBuilder()
      .delete()
      .from(AlunoPlanos)
      .where('idusuario NOT IN (SELECT idusuario FROM usuario)')
      .orWhere('plano_id NOT IN (SELECT id FROM "Plano")')
      .execute();
    console.log(`✅ Removidas ${alunoPlanoOrfaResult.affected} associações órfãs`);

    // 4. Verificar integridade final
    console.log('\n📊 === CONTAGEM FINAL DE REGISTROS ===');

    const [metaCount] = await connection.query('SELECT COUNT(*) as count FROM "Meta"');
    console.log(`📋 Meta: ${metaCount.count} registros`);

    const [sprintCount] = await connection.query('SELECT COUNT(*) as count FROM "Sprints"');
    console.log(`🏃 Sprints: ${sprintCount.count} registros`);

    const [planoCount] = await connection.query('SELECT COUNT(*) as count FROM "Plano"');
    console.log(`📓 Plano: ${planoCount.count} registros`);

    const [alunoPlanoCount] = await connection.query('SELECT COUNT(*) as count FROM "AlunoPlanos"');
    console.log(`👥 AlunoPlanos: ${alunoPlanoCount.count} registros`);

    console.log('\n🎉 Limpeza concluída com sucesso!');
    console.log('✅ Banco pronto para novos testes!');

  } catch (error) {
    console.error('❌ Erro durante limpeza:', error);
  } finally {
    await connection.close();
  }
}

cleanOrphanedData();
