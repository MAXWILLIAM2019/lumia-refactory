import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMetaMestreFields1759784069718 implements MigrationInterface {
  name = 'UpdateMetaMestreFields1759784069718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Atualizar valores de relevancia > 3 para 3
    await queryRunner.query(`
      UPDATE "MetasMestre"
      SET relevancia = 3
      WHERE relevancia > 3
    `);

    // 2. Alterar relevancia de 1-5 para 1-3
    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      DROP CONSTRAINT "MetasMestre_relevancia_check"
    `);

    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      ADD CONSTRAINT "MetasMestre_relevancia_check" CHECK (((relevancia >= 1) AND (relevancia <= 3)))
    `);

    // 2. Alterar tipo de enum para varchar
    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      ALTER COLUMN "tipo" TYPE varchar(50)
    `);

    // 3. Renomear titulo para assunto
    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      RENAME COLUMN "titulo" TO "assunto"
    `);

    // Dropar o enum antigo se não for usado por outras tabelas
    const tipoEnumUsed = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns
      WHERE udt_name = 'enum_MetasMestre_tipo' AND table_name != 'MetasMestre'
    `);

    if (tipoEnumUsed.length === 0) {
      await queryRunner.query(`
        DROP TYPE IF EXISTS "enum_MetasMestre_tipo"
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter: renomear assunto para titulo
    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      RENAME COLUMN "assunto" TO "titulo"
    `);

    // Recriar enum para tipo
    await queryRunner.query(`
      CREATE TYPE "enum_MetasMestre_tipo" AS ENUM('teoria', 'questoes', 'revisao', 'reforco')
    `);

    // Alterar tipo de volta para enum
    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      ALTER COLUMN "tipo" TYPE "enum_MetasMestre_tipo"
      USING "tipo"::"enum_MetasMestre_tipo"
    `);

    // Reverter relevancia para 1-5
    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      DROP CONSTRAINT "MetasMestre_relevancia_check"
    `);

    await queryRunner.query(`
      ALTER TABLE "MetasMestre"
      ADD CONSTRAINT "MetasMestre_relevancia_check" CHECK (((relevancia >= 1) AND (relevancia <= 5)))
    `);
  }
}
