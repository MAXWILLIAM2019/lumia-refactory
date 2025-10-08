import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAtivoToAtivaDisciplina1759784069715 implements MigrationInterface {
  name = 'RenameAtivoToAtivaDisciplina1759784069715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Renomear coluna ativo para ativa na tabela Disciplinas
    await queryRunner.query(`
      ALTER TABLE "Disciplinas"
      RENAME COLUMN "ativo" TO "ativa"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter: renomear coluna ativa para ativo
    await queryRunner.query(`
      ALTER TABLE "Disciplinas"
      RENAME COLUMN "ativa" TO "ativo"
    `);
  }
}
