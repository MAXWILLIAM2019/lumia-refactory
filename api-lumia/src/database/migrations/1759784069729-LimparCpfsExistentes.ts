import { MigrationInterface, QueryRunner } from 'typeorm';

export class LimparCpfsExistentes1759784069729 implements MigrationInterface {
  name = 'LimparCpfsExistentes1759784069729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Verificar se há CPFs que ficariam duplicados após limpeza
    const duplicados = await queryRunner.query(`
      SELECT clean_cpf, COUNT(*)
      FROM (
        SELECT regexp_replace(cpf, '[^0-9]', '', 'g') as clean_cpf
        FROM usuario
        WHERE cpf IS NOT NULL AND cpf ~ '[^0-9]'
      ) t
      GROUP BY clean_cpf
      HAVING COUNT(*) > 1
    `);

    if (duplicados.length > 0) {
      console.error('❌ Limpeza de CPF criaria duplicatas:', duplicados);
      throw new Error('Limpeza de CPF criaria duplicatas. Abortando migration.');
    }

    // 2. Criar backup dos dados originais
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS usuario_cpf_backup AS
      SELECT idusuario, nome, cpf, "createdAt"
      FROM usuario
      WHERE cpf IS NOT NULL AND cpf ~ '[^0-9]'
    `);

    // 3. Executar limpeza dos CPFs na tabela usuario
    const resultadoUsuario = await queryRunner.query(`
      UPDATE usuario
      SET cpf = regexp_replace(cpf, '[^0-9]', '', 'g')
      WHERE cpf IS NOT NULL AND cpf ~ '[^0-9]'
    `);

    // 4. Executar limpeza dos CPFs na tabela aluno_info
    const resultadoAlunoInfo = await queryRunner.query(`
      UPDATE aluno_info
      SET cpf = regexp_replace(cpf, '[^0-9]', '', 'g')
      WHERE cpf IS NOT NULL AND cpf ~ '[^0-9]'
    `);

    console.log(`✅ Migration executada:`);
    console.log(`   - ${resultadoUsuario[1]} CPFs limpos na tabela usuario`);
    console.log(`   - ${resultadoAlunoInfo[1]} CPFs limpos na tabela aluno_info`);
    console.log(`   - Backup criado na tabela usuario_cpf_backup`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter seria complexo pois perderíamos a formatação original
    // Recomendação: restaurar do backup se necessário
    console.warn('⚠️  Reversão não implementada. Use backup manual se necessário.');

    // Opção: mostrar como reverter manualmente
    console.log('Para reverter manualmente:');
    console.log('UPDATE usuario SET cpf = (SELECT cpf FROM usuario_cpf_backup WHERE usuario_cpf_backup.idusuario = usuario.idusuario)');
    console.log('DROP TABLE usuario_cpf_backup;');
  }
}
