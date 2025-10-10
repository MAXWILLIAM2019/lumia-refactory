import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSprintFKToMeta1759784069724 implements MigrationInterface {
  name = 'AddSprintFKToMeta1759784069724';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a FK já existe antes de criar
    const fkExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'Meta_sprint_id_fkey'
      AND table_name = 'Meta'
    `);

    // Adicionar FK para sprint_id -> Sprints.id
    if (fkExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "Meta"
        ADD CONSTRAINT "Meta_sprint_id_fkey"
        FOREIGN KEY ("sprint_id") REFERENCES "Sprints"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
    }

    // Adicionar índice para melhor performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_Meta_sprint_id" ON "Meta" ("sprint_id")
    `);

    console.log('Foreign key e índice adicionados para sprint_id na tabela Meta');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índice
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_Meta_sprint_id"
    `);

    // Remover FK
    await queryRunner.query(`
      ALTER TABLE "Meta"
      DROP CONSTRAINT IF EXISTS "Meta_sprint_id_fkey"
    `);
  }
}
