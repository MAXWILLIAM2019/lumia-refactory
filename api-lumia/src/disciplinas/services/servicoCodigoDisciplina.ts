import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ServicoCodigoDisciplina {
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
   * Gera um código único e determinístico para uma disciplina
   * Mesmo nome sempre gera o mesmo código
   */
  gerarCodigoDisciplina(nome: string): string {
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

  /**
   * Valida se um código segue o padrão esperado
   */
  validarCodigoDisciplina(codigo: string): boolean {
    // Padrão: Pelo menos 1 letra + 5 dígitos
    const regex = /^[A-Z]{1,}[0-9]{5}$/;
    return regex.test(codigo);
  }
}
