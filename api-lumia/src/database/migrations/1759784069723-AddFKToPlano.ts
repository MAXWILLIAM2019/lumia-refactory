import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFKToPlano1759784069723 implements MigrationInterface {
  name = 'AddFKToPlano1759784069723';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Limpar dados órfãos na tabela Plano
    console.log('Limpando dados órfãos na tabela Plano...');

    // Remover planos que referenciam planos mestre inexistentes
    await queryRunner.query(`
      DELETE FROM "Plano"
      WHERE plano_mestre_id IS NOT NULL
      AND plano_mestre_id NOT IN (SELECT id FROM "PlanosMestre")
    `);

    console.log('Dados órfãos removidos da tabela Plano');

    // 2. Verificar se a FK já existe
    const fkExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'Plano_plano_mestre_id_fkey'
      AND table_name = 'Plano'
    `);

    // 3. Adicionar FK para plano_mestre_id -> PlanosMestre.id
    if (fkExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "Plano"
        ADD CONSTRAINT "Plano_plano_mestre_id_fkey"
        FOREIGN KEY ("plano_mestre_id") REFERENCES "PlanosMestre"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
    }

    // 4. Adicionar índice para melhor performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_Plano_plano_mestre_id" ON "Plano" ("plano_mestre_id")
    `);

    console.log('Foreign key e índice adicionados à tabela Plano');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índice
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_Plano_plano_mestre_id"
    `);

    // Remover FK
    await queryRunner.query(`
      ALTER TABLE "Plano"
      DROP CONSTRAINT IF EXISTS "Plano_plano_mestre_id_fkey"
    `);
  }
}
