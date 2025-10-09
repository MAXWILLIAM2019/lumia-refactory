import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMetaInstanceFields1759784069719 implements MigrationInterface {
  name = 'UpdateMetaInstanceFields1759784069719';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Atualizar valores de relevancia > 3 para 3 na tabela Meta
    await queryRunner.query(`
      UPDATE "Meta"
      SET relevancia = 3
      WHERE relevancia > 3
    `);

    // 2. Alterar tipo de enum para varchar na tabela Meta
    await queryRunner.query(`
      ALTER TABLE "Meta"
      ALTER COLUMN "tipo" TYPE varchar(50)
    `);

    // 3. Renomear titulo para assunto na tabela Meta
    await queryRunner.query(`
      ALTER TABLE "Meta"
      RENAME COLUMN "titulo" TO "assunto"
    `);

    // 4. Dropar o enum antigo se não for usado por outras tabelas
    const tipoEnumUsed = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns
      WHERE udt_name = 'enum_Meta_tipo' AND table_name != 'Meta'
    `);

    if (tipoEnumUsed.length === 0) {
      await queryRunner.query(`
        DROP TYPE IF EXISTS "enum_Meta_tipo"
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter: renomear assunto para titulo
    await queryRunner.query(`
      ALTER TABLE "Meta"
      RENAME COLUMN "assunto" TO "titulo"
    `);

    // Recriar enum para tipo
    await queryRunner.query(`
      CREATE TYPE "enum_Meta_tipo" AS ENUM('teoria', 'questoes', 'revisao', 'reforco')
    `);

    // Alterar tipo de volta para enum
    await queryRunner.query(`
      ALTER TABLE "Meta"
      ALTER COLUMN "tipo" TYPE "enum_Meta_tipo"
      USING "tipo"::"enum_Meta_tipo"
    `);

    // Nota: Não revertemos a relevancia pois a constraint não existia originalmente
  }
}
