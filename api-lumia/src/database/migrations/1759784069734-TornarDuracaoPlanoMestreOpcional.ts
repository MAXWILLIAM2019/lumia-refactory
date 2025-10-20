import { MigrationInterface, QueryRunner } from 'typeorm';

export class TornarDuracaoPlanoMestreOpcional1759784069734 implements MigrationInterface {
  name = 'TornarDuracaoPlanoMestreOpcional1759784069734';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🟡 Tornando coluna duracao opcional na tabela PlanosMestre...');
    await queryRunner.query(`ALTER TABLE "PlanosMestre" ALTER COLUMN "duracao" DROP NOT NULL`);
    console.log('✅ Coluna duracao agora permite valores NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Revertendo: tornando coluna duracao obrigatória...');

    // Verificar se há registros com NULL antes de tentar tornar NOT NULL
    const registrosComNull = await queryRunner.query(`
      SELECT COUNT(*) as count FROM "PlanosMestre" WHERE "duracao" IS NULL
    `);

    if (registrosComNull[0].count > 0) {
      throw new Error(
        `Não é possível reverter: ${registrosComNull[0].count} plano(s) mestre têm duração NULL. ` +
        'Remova ou defina valores para estes registros antes de reverter.'
      );
    }

    await queryRunner.query(`ALTER TABLE "PlanosMestre" ALTER COLUMN "duracao" SET NOT NULL`);
    console.log('✅ Coluna duracao restaurada como obrigatória');
  }
}
