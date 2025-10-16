import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoverCamposStatus1759784069730 implements MigrationInterface {
  name = 'RemoverCamposStatus1759784069730';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se as colunas existem antes de tentar remover
    const colunasExistentes = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'aluno_info'
        AND table_schema = 'public'
        AND column_name IN ('status_cadastro', 'status_pagamento')
    `);

    const colunasParaRemover = colunasExistentes.map((col: any) => col.column_name);

    if (colunasParaRemover.includes('status_cadastro')) {
      console.log('🗑️  Removendo coluna status_cadastro da tabela aluno_info');
      await queryRunner.query(`ALTER TABLE "aluno_info" DROP COLUMN "status_cadastro"`);
    } else {
      console.log('⚠️  Coluna status_cadastro não encontrada, pulando...');
    }

    if (colunasParaRemover.includes('status_pagamento')) {
      console.log('🗑️  Removendo coluna status_pagamento da tabela aluno_info');
      await queryRunner.query(`ALTER TABLE "aluno_info" DROP COLUMN "status_pagamento"`);
    } else {
      console.log('⚠️  Coluna status_pagamento não encontrada, pulando...');
    }

    console.log('✅ Campos status_cadastro e status_pagamento removidos com sucesso');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: recriar as colunas com valores padrão
    console.log('🔄 Revertendo: Recriando campos status_cadastro e status_pagamento');

    await queryRunner.query(`
      ALTER TABLE "aluno_info"
      ADD COLUMN "status_cadastro" VARCHAR(20) NOT NULL DEFAULT 'PRE_CADASTRO'
    `);

    await queryRunner.query(`
      ALTER TABLE "aluno_info"
      ADD COLUMN "status_pagamento" VARCHAR(20) NOT NULL DEFAULT 'PENDENTE'
    `);

    console.log('✅ Campos recriados com valores padrão');
  }
}
