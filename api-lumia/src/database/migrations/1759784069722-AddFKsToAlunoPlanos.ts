import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFKsToAlunoPlanos1759784069722 implements MigrationInterface {
  name = 'AddFKsToAlunoPlanos1759784069722';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Limpar dados órfãos antes de adicionar FKs
    console.log('Limpando dados órfãos na tabela AlunoPlanos...');

    // Remover associações com usuários inexistentes
    await queryRunner.query(`
      DELETE FROM "AlunoPlanos"
      WHERE idusuario NOT IN (SELECT idusuario FROM usuario)
    `);

    // Remover associações com planos inexistentes
    await queryRunner.query(`
      DELETE FROM "AlunoPlanos"
      WHERE plano_id NOT IN (SELECT id FROM "Plano")
    `);

    console.log('Dados órfãos removidos com sucesso');

    // 2. Verificar se as FKs já existem antes de criar
    const fkUsuarioExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'AlunoPlanos_idusuario_fkey'
      AND table_name = 'AlunoPlanos'
    `);

    const fkPlanoExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'AlunoPlanos_plano_id_fkey'
      AND table_name = 'AlunoPlanos'
    `);

    // 3. Adicionar FK para idusuario -> usuario.idusuario
    if (fkUsuarioExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "AlunoPlanos"
        ADD CONSTRAINT "AlunoPlanos_idusuario_fkey"
        FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario")
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
    }

    // 4. Adicionar FK para plano_id -> Plano.id
    if (fkPlanoExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "AlunoPlanos"
        ADD CONSTRAINT "AlunoPlanos_plano_id_fkey"
        FOREIGN KEY ("plano_id") REFERENCES "Plano"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
    }

    // 5. Adicionar índices para melhor performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_AlunoPlanos_idusuario" ON "AlunoPlanos" ("idusuario")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_AlunoPlanos_plano_id" ON "AlunoPlanos" ("plano_id")
    `);

    console.log('Foreign keys e índices adicionados com sucesso');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_AlunoPlanos_plano_id"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_AlunoPlanos_idusuario"
    `);

    // Remover FKs
    await queryRunner.query(`
      ALTER TABLE "AlunoPlanos"
      DROP CONSTRAINT IF EXISTS "AlunoPlanos_plano_id_fkey"
    `);

    await queryRunner.query(`
      ALTER TABLE "AlunoPlanos"
      DROP CONSTRAINT IF EXISTS "AlunoPlanos_idusuario_fkey"
    `);
  }
}
