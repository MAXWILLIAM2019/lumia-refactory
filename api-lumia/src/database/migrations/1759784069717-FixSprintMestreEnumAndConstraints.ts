import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSprintMestreEnumAndConstraints1759784069717 implements MigrationInterface {
  name = 'FixSprintMestreEnumAndConstraints1759784069717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primeiro, verificar se o enum StatusMeta já existe, senão criar
    const enumExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'StatusMeta'
    `);

    if (enumExists.length === 0) {
      // Criar o enum StatusMeta se não existir
      await queryRunner.query(`
        CREATE TYPE "StatusMeta" AS ENUM('Pendente', 'Em Andamento', 'Concluída')
      `);
    }

    // Alterar o tipo da coluna status para usar o enum StatusMeta
    await queryRunner.query(`
      ALTER TABLE "SprintsMestre"
      ALTER COLUMN "status" TYPE "StatusMeta"
      USING "status"::"StatusMeta"
    `);

    // Dropar o enum antigo se existir
    const oldEnumExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'enum_SprintsMestre_status'
    `);

    if (oldEnumExists.length > 0) {
      await queryRunner.query(`
        DROP TYPE "enum_SprintsMestre_status"
      `);
    }

    // Adicionar a constraint UNIQUE se não existir
    const constraintExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'plano_mestre_posicao_unique'
      AND table_name = 'SprintsMestre'
    `);

    if (constraintExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "SprintsMestre"
        ADD CONSTRAINT "plano_mestre_posicao_unique" UNIQUE ("plano_mestre_id", "posicao")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover a constraint UNIQUE
    await queryRunner.query(`
      ALTER TABLE "SprintsMestre"
      DROP CONSTRAINT IF EXISTS "plano_mestre_posicao_unique"
    `);

    // Recriar o enum antigo
    await queryRunner.query(`
      CREATE TYPE "enum_SprintsMestre_status" AS ENUM('Pendente', 'Em Andamento', 'Concluída')
    `);

    // Alterar de volta para o enum antigo
    await queryRunner.query(`
      ALTER TABLE "SprintsMestre"
      ALTER COLUMN "status" TYPE "enum_SprintsMestre_status"
      USING "status"::"enum_SprintsMestre_status"
    `);

    // Dropar o enum StatusMeta se não for usado por outras tabelas
    const enumUsed = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns
      WHERE udt_name = 'StatusMeta' AND table_name != 'SprintsMestre'
    `);

    if (enumUsed.length === 0) {
      await queryRunner.query(`
        DROP TYPE IF EXISTS "StatusMeta"
      `);
    }
  }
}
