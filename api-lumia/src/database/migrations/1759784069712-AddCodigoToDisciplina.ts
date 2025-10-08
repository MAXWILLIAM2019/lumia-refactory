import { MigrationInterface, QueryRunner } from 'typeorm';
import * as crypto from 'crypto';

export class AddCodigoToDisciplina1759784069712 implements MigrationInterface {
  name = 'AddCodigoToDisciplina1759784069712';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna codigo como nullable inicialmente
    await queryRunner.query(`
      ALTER TABLE "Disciplinas"
      ADD COLUMN "codigo" varchar(20)
    `);

    // Buscar todas as disciplinas existentes
    const disciplinas = await queryRunner.query(`
      SELECT id, nome FROM "Disciplinas"
    `);

    // Gerar códigos para cada disciplina existente
    for (const disciplina of disciplinas) {
      const codigo = this.gerarCodigoDisciplina(disciplina.nome);
      await queryRunner.query(`
        UPDATE "Disciplinas"
        SET "codigo" = $1
        WHERE id = $2
      `, [codigo, disciplina.id]);
    }

    // Tornar a coluna NOT NULL e UNIQUE
    await queryRunner.query(`
      ALTER TABLE "Disciplinas"
      ALTER COLUMN "codigo" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "Disciplinas"
      ADD CONSTRAINT "UQ_Disciplinas_codigo" UNIQUE ("codigo")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover constraint e coluna
    await queryRunner.query(`
      ALTER TABLE "Disciplinas"
      DROP CONSTRAINT IF EXISTS "UQ_Disciplinas_codigo"
    `);

    await queryRunner.query(`
      ALTER TABLE "Disciplinas"
      DROP COLUMN "codigo"
    `);
  }

  /**
   * Normaliza o nome removendo acentos e caracteres especiais
   */
  private normalizarNome(nome: string): string {
    return nome
      .normalize('NFD') // Decompor caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiais, manter apenas letras, números e espaços
      .toUpperCase();
  }

  /**
   * Gera código determinístico para uma disciplina
   * Mesmo nome sempre gera o mesmo código
   */
  private gerarCodigoDisciplina(nome: string): string {
    if (!nome || nome.trim().length === 0) {
      throw new Error('Nome da disciplina é obrigatório');
    }

    // Normalizar nome removendo acentos e caracteres especiais
    const nomeNormalizado = this.normalizarNome(nome);
    const partes = nomeNormalizado.trim().split(/\s+/);

    let prefixo: string;

    if (partes.length >= 2) {
      // Nome composto: 1º char primeiro nome + 3 primeiros chars segundo nome
      const primeiroChar = partes[0].charAt(0);
      const tresCharsSegundo = partes[1].substring(0, 3);
      prefixo = primeiroChar + tresCharsSegundo;
    } else {
      // Nome simples: usar os primeiros 4 caracteres
      prefixo = partes[0].substring(0, 4);
    }

    // Garantir exatamente 4 caracteres (preencher com 'X' se necessário)
    prefixo = prefixo.padEnd(4, 'X');

    // Gerar hash determinístico do nome completo
    const hash = crypto.createHash('md5').update(nome.toLowerCase().trim()).digest('hex');

    // Extrair 5 dígitos do hash (0-65535) e converter para 10000-99999
    const numeroHash = parseInt(hash.substring(0, 4), 16);
    const numero = (numeroHash % 90000) + 10000;

    return `${prefixo}${numero}`;
  }
}
