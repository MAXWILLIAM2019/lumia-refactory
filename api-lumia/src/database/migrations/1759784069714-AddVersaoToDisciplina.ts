import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVersaoToDisciplina1759784069714 implements MigrationInterface {
  name = 'AddVersaoToDisciplina1759784069714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna versao com valor padrão 1
    await queryRunner.query(`
      ALTER TABLE "Disciplinas"
      ADD COLUMN "versao" integer NOT NULL DEFAULT 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover coluna versao
    await queryRunner.query(`
      ALTER TABLE "Disciplinas"
      DROP COLUMN "versao"
    `);
  }
}
