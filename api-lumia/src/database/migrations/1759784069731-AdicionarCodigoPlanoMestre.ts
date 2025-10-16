import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdicionarCodigoPlanoMestre1759784069731 implements MigrationInterface {
  name = 'AdicionarCodigoPlanoMestre1759784069731';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a coluna já existe antes de tentar adicionar
    const colunaExistente = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'PlanosMestre'
        AND table_schema = 'public'
        AND column_name = 'codigo'
    `);

    if (colunaExistente.length === 0) {
      console.log('🆕 Adicionando coluna codigo na tabela PlanosMestre');

      // 1. Adicionar coluna nullable primeiro (sem constraints)
      await queryRunner.query(`
        ALTER TABLE "PlanosMestre"
        ADD COLUMN "codigo" VARCHAR(20)
      `);

      console.log('📝 Coluna codigo adicionada (nullable)');

      // 2. Buscar todos os planos mestre existentes
      const planosExistentes = await queryRunner.query(`
        SELECT id, nome FROM "PlanosMestre" ORDER BY id
      `);

      console.log(`📊 Encontrados ${planosExistentes.length} planos mestre para popular códigos`);

      // 3. Para cada plano, gerar e atualizar código
      for (const plano of planosExistentes) {
        // Gerar código usando a mesma lógica do serviço
        const nomeNormalizado = plano.nome
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .toUpperCase();

        const partes = nomeNormalizado.trim().split(/\s+/);
        let prefixo: string;

        if (partes.length >= 2) {
          const primeiroChar = partes[0].charAt(0);
          const tresCharsSegundo = partes[1].substring(0, 3);
          prefixo = primeiroChar + tresCharsSegundo;
        } else {
          prefixo = partes[0].substring(0, 4);
        }

        prefixo = prefixo.padEnd(4, 'X');

        // Gerar hash determinístico
        const crypto = require('crypto');
        const hash = crypto.createHash('md5').update(plano.nome.toLowerCase().trim()).digest('hex');
        const numeroHash = parseInt(hash.substring(0, 4), 16);
        const numero = (numeroHash % 90000) + 10000;
        const codigo = `${prefixo}${numero}`;

        // Atualizar o registro
        await queryRunner.query(`
          UPDATE "PlanosMestre"
          SET "codigo" = $1
          WHERE id = $2
        `, [codigo, plano.id]);

        console.log(`✅ Plano "${plano.nome}" (ID: ${plano.id}) → Código: ${codigo}`);
      }

      // 4. Tornar a coluna NOT NULL e UNIQUE
      await queryRunner.query(`
        ALTER TABLE "PlanosMestre"
        ALTER COLUMN "codigo" SET NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "PlanosMestre"
        ADD CONSTRAINT "UQ_PlanosMestre_codigo" UNIQUE ("codigo")
      `);

      console.log('✅ Coluna codigo configurada como NOT NULL UNIQUE');
      console.log('✅ Migration concluída com sucesso!');
    } else {
      console.log('⚠️  Coluna codigo já existe na tabela PlanosMestre');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Revertendo: Removendo coluna codigo da tabela PlanosMestre');

    // Verificar se a coluna existe antes de tentar remover
    const colunaExistente = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'PlanosMestre'
        AND table_schema = 'public'
        AND column_name = 'codigo'
    `);

    if (colunaExistente.length > 0) {
      // Remover constraint primeiro
      await queryRunner.query(`
        ALTER TABLE "PlanosMestre" DROP CONSTRAINT IF EXISTS "UQ_PlanosMestre_codigo"
      `);

      // Depois remover a coluna
      await queryRunner.query(`ALTER TABLE "PlanosMestre" DROP COLUMN "codigo"`);
      console.log('✅ Coluna codigo e constraint removidos com sucesso');
    } else {
      console.log('⚠️  Coluna codigo não existe na tabela PlanosMestre');
    }
  }
}
