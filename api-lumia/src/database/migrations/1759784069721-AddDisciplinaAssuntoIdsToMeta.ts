import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDisciplinaAssuntoIdsToMeta1759784069721 implements MigrationInterface {
  name = 'AddDisciplinaAssuntoIdsToMeta1759784069721';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Adicionar colunas disciplina_id e assunto_id
    await queryRunner.query(`
      ALTER TABLE "Meta"
      ADD COLUMN "disciplina_id" integer,
      ADD COLUMN "assunto_id" integer
    `);

    // 2. Popular os IDs baseado nos nomes (através das tabelas Disciplina e Assunto)
    // Como temos os nomes salvos, vamos fazer o match
    await queryRunner.query(`
      UPDATE "Meta"
      SET "disciplina_id" = d.id
      FROM "Disciplinas" d
      WHERE "Meta".disciplina = d.nome AND d.ativa = true
    `);

    await queryRunner.query(`
      UPDATE "Meta"
      SET "assunto_id" = a.id
      FROM "Assuntos" a
      JOIN "Disciplinas" d ON a.disciplina_id = d.id
      WHERE "Meta".assunto = a.nome
      AND "Meta".disciplina = d.nome
      AND d.ativa = true
    `);

    // 3. Para registros que não conseguiram match, vamos definir valores padrão
    // Primeiro, vamos encontrar uma disciplina e assunto padrão
    const disciplinaPadrao = await queryRunner.query(`
      SELECT id FROM "Disciplinas" WHERE ativa = true LIMIT 1
    `);

    const assuntoPadrao = await queryRunner.query(`
      SELECT id FROM "Assuntos" LIMIT 1
    `);

    if (disciplinaPadrao.length > 0) {
      await queryRunner.query(`
        UPDATE "Meta"
        SET "disciplina_id" = $1
        WHERE "disciplina_id" IS NULL
      `, [disciplinaPadrao[0].id]);
    }

    if (assuntoPadrao.length > 0) {
      await queryRunner.query(`
        UPDATE "Meta"
        SET "assunto_id" = $1
        WHERE "assunto_id" IS NULL
      `, [assuntoPadrao[0].id]);
    }

    // 4. Tornar as colunas NOT NULL após popular
    await queryRunner.query(`
      ALTER TABLE "Meta"
      ALTER COLUMN "disciplina_id" SET NOT NULL,
      ALTER COLUMN "assunto_id" SET NOT NULL
    `);

    // 5. Adicionar constraints de chave estrangeira
    await queryRunner.query(`
      ALTER TABLE "Meta"
      ADD CONSTRAINT "Meta_disciplina_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "Disciplinas"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      ADD CONSTRAINT "Meta_assunto_fkey" FOREIGN KEY ("assunto_id") REFERENCES "Assuntos"(id) ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // 6. Adicionar índices para performance
    await queryRunner.query(`
      CREATE INDEX "IDX_Meta_disciplina_id" ON "Meta" ("disciplina_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_Meta_assunto_id" ON "Meta" ("assunto_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_Meta_assunto_id",
      DROP INDEX IF EXISTS "IDX_Meta_disciplina_id"
    `);

    // Remover constraints
    await queryRunner.query(`
      ALTER TABLE "Meta"
      DROP CONSTRAINT IF EXISTS "Meta_assunto_fkey",
      DROP CONSTRAINT IF EXISTS "Meta_disciplina_fkey"
    `);

    // Remover colunas
    await queryRunner.query(`
      ALTER TABLE "Meta"
      DROP COLUMN IF EXISTS "assunto_id",
      DROP COLUMN IF EXISTS "disciplina_id"
    `);
  }
}
