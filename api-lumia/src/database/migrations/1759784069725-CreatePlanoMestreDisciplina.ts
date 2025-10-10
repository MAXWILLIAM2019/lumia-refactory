import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlanoMestreDisciplina1759784069725 implements MigrationInterface {
  name = 'CreatePlanoMestreDisciplina1759784069725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela PlanoMestreDisciplina
    await queryRunner.query(`
      CREATE TABLE "PlanoMestreDisciplina" (
        "plano_mestre_id" integer NOT NULL,
        "disciplina_id" integer NOT NULL,
        "createdAt" timestamptz NOT NULL,
        "updatedAt" timestamptz NOT NULL,
        CONSTRAINT "PK_PlanoMestreDisciplina" PRIMARY KEY ("plano_mestre_id", "disciplina_id")
      )
    `);

    // Adicionar FKs
    await queryRunner.query(`
      ALTER TABLE "PlanoMestreDisciplina"
      ADD CONSTRAINT "PlanoMestreDisciplina_PlanoMestreId_fkey"
      FOREIGN KEY ("plano_mestre_id") REFERENCES "PlanosMestre"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "PlanoMestreDisciplina"
      ADD CONSTRAINT "PlanoMestreDisciplina_DisciplinaId_fkey"
      FOREIGN KEY ("disciplina_id") REFERENCES "Disciplinas"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // Adicionar índices para performance
    await queryRunner.query(`
      CREATE INDEX "IDX_PlanoMestreDisciplina_plano_mestre_id"
      ON "PlanoMestreDisciplina" ("plano_mestre_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_PlanoMestreDisciplina_disciplina_id"
      ON "PlanoMestreDisciplina" ("disciplina_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PlanoMestreDisciplina_disciplina_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PlanoMestreDisciplina_plano_mestre_id"`);

    // Remover FKs
    await queryRunner.query(`ALTER TABLE "PlanoMestreDisciplina" DROP CONSTRAINT IF EXISTS "PlanoMestreDisciplina_DisciplinaId_fkey"`);
    await queryRunner.query(`ALTER TABLE "PlanoMestreDisciplina" DROP CONSTRAINT IF EXISTS "PlanoMestreDisciplina_PlanoMestreId_fkey"`);

    // Remover tabela
    await queryRunner.query(`DROP TABLE "PlanoMestreDisciplina"`);
  }
}
