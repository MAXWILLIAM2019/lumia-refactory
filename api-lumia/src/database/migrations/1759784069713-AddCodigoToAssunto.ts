import { MigrationInterface, QueryRunner } from 'typeorm';
import * as crypto from 'crypto';

export class AddCodigoToAssunto1759784069713 implements MigrationInterface {
  name = 'AddCodigoToAssunto1759784069713';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna codigo como nullable inicialmente
    await queryRunner.query(`
      ALTER TABLE "Assuntos"
      ADD COLUMN "codigo" varchar(20)
    `);

    // Buscar todos os assuntos existentes
    const assuntos = await queryRunner.query(`
      SELECT id, nome FROM "Assuntos"
    `);

    // Gerar códigos para cada assunto existente
    for (const assunto of assuntos) {
      const codigo = this.gerarCodigoAssunto(assunto.nome);
      await queryRunner.query(`
        UPDATE "Assuntos"
        SET "codigo" = $1
        WHERE id = $2
      `, [codigo, assunto.id]);
    }

    // Tornar a coluna NOT NULL e UNIQUE
    await queryRunner.query(`
      ALTER TABLE "Assuntos"
      ALTER COLUMN "codigo" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "Assuntos"
      ADD CONSTRAINT "UQ_Assuntos_codigo" UNIQUE ("codigo")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover constraint e coluna
    await queryRunner.query(`
      ALTER TABLE "Assuntos"
      DROP CONSTRAINT IF EXISTS "UQ_Assuntos_codigo"
    `);

    await queryRunner.query(`
      ALTER TABLE "Assuntos"
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
   * Gera código determinístico para um assunto
   * Mesmo nome sempre gera o mesmo código
   * Usa a mesma lógica das disciplinas: 1º char primeiro nome + 3 primeiros chars segundo nome
   */
  private gerarCodigoAssunto(nome: string): string {
    if (!nome || nome.trim().length === 0) {
      throw new Error('Nome do assunto é obrigatório');
    }

    // Normalizar nome removendo acentos e caracteres especiais
    const nomeNormalizado = this.normalizarNome(nome);
    const partes = nomeNormalizado.trim().split(/\s+/);

    let prefixo: string;

    if (partes.length >= 2) {
      // Nome composto: 1º char primeiro nome + 3 primeiros chars segundo nome (igual às disciplinas)
      const primeiroChar = partes[0].charAt(0);
      const tresCharsSegundo = partes[1].substring(0, 3);
      prefixo = primeiroChar + tresCharsSegundo;
    } else {
      // Nome simples: 4 primeiros chars
      prefixo = partes[0].substring(0, 4);
    }

    // Garantir pelo menos 1 caracter
    if (!prefixo) {
      prefixo = 'ASSU'; // Fallback para casos extremos
    }

    // Garantir prefixo de exatamente 4 caracteres (preencher se necessário)
    prefixo = prefixo.padEnd(4, 'X');

    // Gerar hash determinístico do nome completo
    const hash = crypto.createHash('md5').update(nome.toLowerCase().trim()).digest('hex');

    // Extrair 5 dígitos do hash (0-65535) e converter para 10000-99999
    const numeroHash = parseInt(hash.substring(0, 4), 16);
    const numero = (numeroHash % 90000) + 10000;

    return `${prefixo}${numero}`;
  }
}
