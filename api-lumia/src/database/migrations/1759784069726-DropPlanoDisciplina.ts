import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPlanoDisciplina1759784069726 implements MigrationInterface {
  name = 'DropPlanoDisciplina1759784069726';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a tabela existe antes de tentar dropar
    const tableExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'PlanoDisciplina'
    `);

    if (tableExists.length > 0) {
      // Remover FKs primeiro
      await queryRunner.query(`ALTER TABLE "PlanoDisciplina" DROP CONSTRAINT IF EXISTS "PlanoDisciplina_DisciplinaId_fkey"`);
      await queryRunner.query(`ALTER TABLE "PlanoDisciplina" DROP CONSTRAINT IF EXISTS "PlanoDisciplina_PlanoId_fkey"`);

      // Dropar tabela
      await queryRunner.query(`DROP TABLE "PlanoDisciplina"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recriar tabela no rollback
    await queryRunner.query(`
      CREATE TABLE "PlanoDisciplina" (
        "createdAt" timestamptz NOT NULL,
        "updatedAt" timestamptz NOT NULL,
        "plano_id" integer NOT NULL,
        "disciplina_id" integer NOT NULL,
        CONSTRAINT "PlanoDisciplina_pkey" PRIMARY KEY ("plano_id", "disciplina_id")
      )
    `);

    // Recriar FKs
    await queryRunner.query(`
      ALTER TABLE "PlanoDisciplina"
      ADD CONSTRAINT "PlanoDisciplina_PlanoId_fkey"
      FOREIGN KEY ("plano_id") REFERENCES "Plano"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "PlanoDisciplina"
      ADD CONSTRAINT "PlanoDisciplina_DisciplinaId_fkey"
      FOREIGN KEY ("disciplina_id") REFERENCES "Disciplinas"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }
}
