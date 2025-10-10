import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFKToSprintMestreId1759784069728 implements MigrationInterface {
  name = 'AddFKToSprintMestreId1759784069728';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Limpar dados órfãos antes de adicionar FK
    console.log('Limpando dados órfãos na tabela Sprints...');

    // Remover associações com sprints mestre inexistentes
    await queryRunner.query(`
      DELETE FROM "Sprints"
      WHERE sprint_mestre_id IS NOT NULL
      AND sprint_mestre_id NOT IN (SELECT id FROM "SprintsMestre")
    `);

    console.log('Dados órfãos removidos com sucesso');

    // 2. Verificar se a FK já existe antes de criar
    const fkExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'Sprints_sprint_mestre_id_fkey'
      AND table_name = 'Sprints'
    `);

    // 3. Adicionar FK para sprint_mestre_id -> SprintsMestre.id
    if (fkExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "Sprints"
        ADD CONSTRAINT "Sprints_sprint_mestre_id_fkey"
        FOREIGN KEY ("sprint_mestre_id") REFERENCES "SprintsMestre"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
    }

    // 4. Adicionar índice para melhor performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_Sprints_sprint_mestre_id" ON "Sprints" ("sprint_mestre_id")
    `);

    console.log('Foreign key e índice adicionados com sucesso à tabela Sprints');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índice
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_Sprints_sprint_mestre_id"
    `);

    // Remover constraint
    await queryRunner.query(`
      ALTER TABLE "Sprints"
      DROP CONSTRAINT IF EXISTS "Sprints_sprint_mestre_id_fkey"
    `);
  }
}
