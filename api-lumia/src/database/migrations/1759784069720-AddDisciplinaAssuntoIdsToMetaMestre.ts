import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDisciplinaAssuntoIdsToMetaMestre1759784069720 implements MigrationInterface {
  name = 'AddDisciplinaAssuntoIdsToMetaMestre1759784069720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Adicionar colunas disciplina_id e assunto_id
    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      ADD COLUMN "disciplina_id" integer,
      ADD COLUMN "assunto_id" integer
    `);

    // 2. Popular os IDs baseado nos nomes (através das tabelas Disciplina e Assunto)
    // Como temos os nomes salvos, vamos fazer o match
    await queryRunner.query(`
      UPDATE "MetasMestre"
      SET "disciplina_id" = d.id
      FROM "Disciplinas" d
      WHERE "MetasMestre".disciplina = d.nome AND d.ativa = true
    `);

    await queryRunner.query(`
      UPDATE "MetasMestre"
      SET "assunto_id" = a.id
      FROM "Assuntos" a
      JOIN "Disciplinas" d ON a.disciplina_id = d.id
      WHERE "MetasMestre".assunto = a.nome
      AND "MetasMestre".disciplina = d.nome
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
        UPDATE "MetasMestre"
        SET "disciplina_id" = $1
        WHERE "disciplina_id" IS NULL
      `, [disciplinaPadrao[0].id]);
    }

    if (assuntoPadrao.length > 0) {
      await queryRunner.query(`
        UPDATE "MetasMestre"
        SET "assunto_id" = $1
        WHERE "assunto_id" IS NULL
      `, [assuntoPadrao[0].id]);
    }

    // 4. Tornar as colunas NOT NULL após popular
    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      ALTER COLUMN "disciplina_id" SET NOT NULL,
      ALTER COLUMN "assunto_id" SET NOT NULL
    `);

    // 4. Adicionar constraints de chave estrangeira
    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      ADD CONSTRAINT "MetasMestre_disciplina_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "Disciplinas"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      ADD CONSTRAINT "MetasMestre_assunto_fkey" FOREIGN KEY ("assunto_id") REFERENCES "Assuntos"(id) ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // 5. Adicionar índices para performance
    await queryRunner.query(`
      CREATE INDEX "IDX_MetasMestre_disciplina_id" ON "MetasMestre" ("disciplina_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_MetasMestre_assunto_id" ON "MetasMestre" ("assunto_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_MetasMestre_assunto_id",
      DROP INDEX IF EXISTS "IDX_MetasMestre_disciplina_id"
    `);

    // Remover constraints
    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      DROP CONSTRAINT IF EXISTS "MetasMestre_assunto_fkey",
      DROP CONSTRAINT IF EXISTS "MetasMestre_disciplina_fkey"
    `);

    // Remover colunas
    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      DROP COLUMN IF EXISTS "assunto_id",
      DROP COLUMN IF EXISTS "disciplina_id"
    `);
  }
}
