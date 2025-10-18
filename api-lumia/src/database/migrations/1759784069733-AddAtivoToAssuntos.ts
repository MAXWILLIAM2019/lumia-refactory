import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAtivoToAssuntos1759784069733 implements MigrationInterface {
  name = 'AddAtivoToAssuntos1759784069733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna 'ativo' na tabela Assuntos
    await queryRunner.query(`
      ALTER TABLE "Assuntos"
      ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover coluna 'ativo' da tabela Assuntos
    await queryRunner.query(`
      ALTER TABLE "Assuntos"
      DROP COLUMN "ativo"
    `);
  }
}
