import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFKsToSprintAtual1759784069727 implements MigrationInterface {
  name = 'AddFKsToSprintAtual1759784069727';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Limpar dados órfãos antes de adicionar FKs
    console.log('Limpando dados órfãos na tabela SprintAtual...');

    // Remover associações com usuários inexistentes
    await queryRunner.query(`
      DELETE FROM "SprintAtual"
      WHERE idusuario NOT IN (SELECT idusuario FROM usuario)
    `);

    // Remover associações com sprints inexistentes
    await queryRunner.query(`
      DELETE FROM "SprintAtual"
      WHERE sprint_id NOT IN (SELECT id FROM "Sprints")
    `);

    console.log('Dados órfãos removidos com sucesso');

    // 2. Verificar se as FKs já existem antes de criar
    const fkUsuarioExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'SprintAtual_idusuario_fkey'
      AND table_name = 'SprintAtual'
    `);

    const fkSprintExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'SprintAtual_sprint_id_fkey'
      AND table_name = 'SprintAtual'
    `);

    // 3. Adicionar FK para idusuario -> usuario.idusuario
    if (fkUsuarioExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "SprintAtual"
        ADD CONSTRAINT "SprintAtual_idusuario_fkey"
        FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario")
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
    }

    // 4. Adicionar FK para sprint_id -> Sprints.id
    if (fkSprintExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "SprintAtual"
        ADD CONSTRAINT "SprintAtual_sprint_id_fkey"
        FOREIGN KEY ("sprint_id") REFERENCES "Sprints"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
    }

    // 5. Adicionar índices para melhor performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_SprintAtual_idusuario" ON "SprintAtual" ("idusuario")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_SprintAtual_sprint_id" ON "SprintAtual" ("sprint_id")
    `);

    console.log('Foreign keys e índices adicionados com sucesso à tabela SprintAtual');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_SprintAtual_sprint_id"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_SprintAtual_idusuario"
    `);

    // Remover constraints
    await queryRunner.query(`
      ALTER TABLE "SprintAtual"
      DROP CONSTRAINT IF EXISTS "SprintAtual_sprint_id_fkey"
    `);
    await queryRunner.query(`
      ALTER TABLE "SprintAtual"
      DROP CONSTRAINT IF EXISTS "SprintAtual_idusuario_fkey"
    `);
  }
}
