import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDescricaoFromDisciplina1759784069732 implements MigrationInterface {
  name = 'RemoveDescricaoFromDisciplina1759784069732';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remover coluna descricao da tabela Disciplinas
    await queryRunner.query(`
      ALTER TABLE "Disciplinas"
      DROP COLUMN "descricao"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recriar coluna descricao na tabela Disciplinas
    await queryRunner.query(`
      ALTER TABLE "Disciplinas"
      ADD COLUMN "descricao" text
    `);
  }
}
