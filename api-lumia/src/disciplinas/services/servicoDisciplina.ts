import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Disciplina } from '../entities/disciplina.entity';
import { Assunto } from '../entities/assunto.entity';
import { CriarDisciplinaDto } from '../dto/criarDisciplina.dto';
import { AtualizarDisciplinaDto } from '../dto/atualizarDisciplina.dto';
import { CriarVersaoDisciplinaDto } from '../dto/criarVersaoDisciplina.dto';
import { ServicoCodigoDisciplina } from './servicoCodigoDisciplina';
import { ServicoCodigoAssunto } from './servicoCodigoAssunto';

@Injectable()
export class ServicoDisciplina {
  constructor(
    @InjectRepository(Disciplina)
    private disciplinaRepository: Repository<Disciplina>,
    @InjectRepository(Assunto)
    private assuntoRepository: Repository<Assunto>,
    private dataSource: DataSource,
    private servicoCodigoDisciplina: ServicoCodigoDisciplina,
    private servicoCodigoAssunto: ServicoCodigoAssunto,
  ) {}

  // ===== MÉTODOS PARA DISCIPLINA =====

  async listarDisciplinas(): Promise<Disciplina[]> {
    return await this.disciplinaRepository.find({
      relations: ['assuntos'],
      order: { nome: 'ASC' },
    });
  }

  async listarDisciplinasAtivas(): Promise<Disciplina[]> {
    return await this.disciplinaRepository.find({
      where: { ativa: true },
      relations: ['assuntos'],
      order: { nome: 'ASC' },
    });
  }

  async buscarDisciplinaPorId(id: number): Promise<Disciplina> {
    const disciplina = await this.disciplinaRepository.findOne({
      where: { id },
      relations: ['assuntos'],
    });

    if (!disciplina) {
      throw new NotFoundException('Disciplina não encontrada');
    }

    return disciplina;
  }

  async criarDisciplina(dadosDisciplina: CriarDisciplinaDto): Promise<Disciplina> {
    // Verificar se já existe uma disciplina com o mesmo nome (case-insensitive)
    const disciplinaExistente = await this.disciplinaRepository
      .createQueryBuilder('disciplina')
      .where('LOWER(disciplina.nome) = LOWER(:nome)', { nome: dadosDisciplina.nome })
      .getOne();

    if (disciplinaExistente) {
      throw new ConflictException('Já existe uma disciplina com este nome');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Gerar código único para a disciplina (sempre automático)
      const codigo = this.servicoCodigoDisciplina.gerarCodigoDisciplina(dadosDisciplina.nome);

      // Verificar se o código já existe (dentro da transação)
      const codigoExistente = await queryRunner.manager.findOne(Disciplina, {
        where: { codigo }
      });

      if (codigoExistente) {
        throw new ConflictException(`Já existe uma disciplina com o código '${codigo}'`);
      }

      // Criar a disciplina (sempre ativa por padrão)
      const disciplina = queryRunner.manager.create(Disciplina, {
        nome: dadosDisciplina.nome,
        codigo: codigo,
        descricao: dadosDisciplina.descricao,
        ativa: true, // Sempre ativa no cadastro
        versao: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const disciplinaSalva = await queryRunner.manager.save(disciplina);

      // Se houver assuntos, adicioná-los
      if (dadosDisciplina.assuntos && dadosDisciplina.assuntos.length > 0) {
        const assuntosData = dadosDisciplina.assuntos.map(assunto => {
          // Gerar código único para o assunto (sempre automático)
          const codigoAssunto = this.servicoCodigoAssunto.gerarCodigoAssunto(assunto.nome);

          return {
            nome: assunto.nome,
            codigo: codigoAssunto,
            disciplinaId: disciplinaSalva.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        });

        await queryRunner.manager.save(Assunto, assuntosData);
      }

      await queryRunner.commitTransaction();

      // Retornar a disciplina criada com seus assuntos
      return await this.buscarDisciplinaPorId(disciplinaSalva.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async atualizarDisciplina(id: number, dadosAtualizacao: AtualizarDisciplinaDto): Promise<Disciplina> {
    const disciplina = await this.buscarDisciplinaPorId(id);

    // Verificar se a disciplina está sendo usada por algum plano
    // TODO: Implementar verificação de uso em planos quando o módulo de planos estiver completo
    const disciplinaEmUso = false; // Temporariamente false

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!disciplinaEmUso) {
        // Atualizar diretamente se não estiver em uso
        await this.atualizarDisciplinaDiretamente(id, dadosAtualizacao, queryRunner);
      } else {
        // Criar nova versão se estiver em uso
        await this.criarNovaVersaoDisciplina(id, dadosAtualizacao, queryRunner);
      }

      await queryRunner.commitTransaction();
      return await this.buscarDisciplinaPorId(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removerDisciplina(id: number): Promise<void> {
    const disciplina = await this.buscarDisciplinaPorId(id);

    // Verificar se a disciplina está sendo usada por algum plano
    // TODO: Implementar verificação de uso em planos
    const disciplinaEmUso = false; // Temporariamente false

    if (disciplinaEmUso) {
      throw new BadRequestException('Não é possível remover uma disciplina que está sendo usada por planos');
    }

    await this.disciplinaRepository.remove(disciplina);
  }

  async criarVersaoDisciplina(id: number, dadosVersao: CriarVersaoDisciplinaDto): Promise<Disciplina> {
    const disciplinaOriginal = await this.buscarDisciplinaPorId(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Determinar a disciplina raiz
      const idOrigem = disciplinaOriginal.disciplinaOrigemId || disciplinaOriginal.id;

      // Buscar a última versão para incrementar
      const ultimaVersao = await queryRunner.manager
        .createQueryBuilder(Disciplina, 'disciplina')
        .where('disciplina.id = :idOrigem OR disciplina.disciplinaOrigemId = :idOrigem', { idOrigem })
        .orderBy('disciplina.versao', 'DESC')
        .getOne();

      const novaVersao = ultimaVersao ? ultimaVersao.versao + 1 : 1;

      // Criar a nova versão da disciplina
      const nomeFormatado = `${dadosVersao.nome} (editada) v${novaVersao}`;

      const novaDisciplina = queryRunner.manager.create(Disciplina, {
        nome: nomeFormatado,
        descricao: dadosVersao.descricao || disciplinaOriginal.descricao,
        versao: novaVersao,
        ativa: dadosVersao.ativa !== false,
        disciplinaOrigemId: idOrigem,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const disciplinaSalva = await queryRunner.manager.save(novaDisciplina);

      // Tratar os assuntos
      if (dadosVersao.copiarAssuntos && disciplinaOriginal.assuntos && disciplinaOriginal.assuntos.length > 0) {
        // Copiar os assuntos da versão original
        const assuntosData = disciplinaOriginal.assuntos.map(assunto => ({
          nome: assunto.nome,
          disciplinaId: disciplinaSalva.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await queryRunner.manager.save(Assunto, assuntosData);
      } else if (dadosVersao.assuntos && dadosVersao.assuntos.length > 0) {
        // Usar os novos assuntos fornecidos
        const assuntosData = dadosVersao.assuntos.map(assunto => ({
          nome: assunto.nome,
          disciplinaId: disciplinaSalva.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await queryRunner.manager.save(Assunto, assuntosData);
      }

      await queryRunner.commitTransaction();
      return await this.buscarDisciplinaPorId(disciplinaSalva.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listarVersoesDisciplina(id: number): Promise<Disciplina[]> {
    const disciplina = await this.buscarDisciplinaPorId(id);

    // Determinar a disciplina raiz
    const idOrigem = disciplina.disciplinaOrigemId || disciplina.id;

    // Buscar todas as versões, incluindo a original
    return await this.disciplinaRepository
      .createQueryBuilder('disciplina')
      .leftJoinAndSelect('disciplina.assuntos', 'assuntos')
      .where('disciplina.id = :idOrigem OR disciplina.disciplinaOrigemId = :idOrigem', { idOrigem })
      .orderBy('disciplina.versao', 'ASC')
      .getMany();
  }

  async compararVersoesDisciplina(id1: number, id2: number): Promise<any> {
    const disciplina1 = await this.buscarDisciplinaPorId(id1);
    const disciplina2 = await this.buscarDisciplinaPorId(id2);

    // Verificar se são versões da mesma disciplina
    const origem1 = disciplina1.disciplinaOrigemId || disciplina1.id;
    const origem2 = disciplina2.disciplinaOrigemId || disciplina2.id;

    if (origem1 !== origem2) {
      throw new BadRequestException('As disciplinas não são versões da mesma disciplina original');
    }

    // Criar objeto de diferenças
    const diferencas = {
      metadados: {
        disciplina1: {
          id: disciplina1.id,
          versao: disciplina1.versao,
        },
        disciplina2: {
          id: disciplina2.id,
          versao: disciplina2.versao,
        },
      },
      campos: {},
      assuntos: {
        adicionados: [],
        removidos: [],
        mantidos: [],
      },
    };

    // Comparar campos básicos
    ['nome', 'descricao', 'ativa'].forEach(campo => {
      if (disciplina1[campo] !== disciplina2[campo]) {
        diferencas.campos[campo] = {
          antes: disciplina1[campo],
          depois: disciplina2[campo],
        };
      }
    });

    // Comparar assuntos
    const assuntos1 = disciplina1.assuntos.map(a => a.nome);
    const assuntos2 = disciplina2.assuntos.map(a => a.nome);

    diferencas.assuntos.adicionados = assuntos2.filter(a => !assuntos1.includes(a));
    diferencas.assuntos.removidos = assuntos1.filter(a => !assuntos2.includes(a));
    diferencas.assuntos.mantidos = assuntos1.filter(a => assuntos2.includes(a));

    return diferencas;
  }

  // ===== MÉTODOS AUXILIARES =====

  private async atualizarDisciplinaDiretamente(
    id: number,
    dadosAtualizacao: AtualizarDisciplinaDto,
    queryRunner: any,
  ): Promise<void> {
    // Se o nome for alterado, verificar se já existe outra disciplina com o mesmo nome
    if (dadosAtualizacao.nome) {
      const disciplinaExistente = await queryRunner.manager
        .createQueryBuilder(Disciplina, 'disciplina')
        .where('disciplina.id != :id', { id })
        .andWhere('LOWER(disciplina.nome) = LOWER(:nome)', { nome: dadosAtualizacao.nome })
        .getOne();

      if (disciplinaExistente) {
        throw new ConflictException('Já existe outra disciplina com este nome');
      }
    }

    // Atualizar a disciplina
    const dadosAtualizacaoFinal = {
      ...dadosAtualizacao,
      updatedAt: new Date(),
    };

    await queryRunner.manager.update(Disciplina, id, dadosAtualizacaoFinal);

    // Se houver assuntos, atualizá-los
    if (dadosAtualizacao.assuntos && Array.isArray(dadosAtualizacao.assuntos)) {
      // Remover todos os assuntos existentes
      await queryRunner.manager.delete(Assunto, { disciplinaId: id });

      // Adicionar os novos assuntos
      if (dadosAtualizacao.assuntos.length > 0) {
        const assuntosData = dadosAtualizacao.assuntos.map(assunto => ({
          nome: assunto.nome,
          disciplinaId: id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await queryRunner.manager.save(Assunto, assuntosData);
      }
    }
  }

  private async criarNovaVersaoDisciplina(
    id: number,
    dadosAtualizacao: AtualizarDisciplinaDto,
    queryRunner: any,
  ): Promise<void> {
    const disciplina = await queryRunner.manager.findOne(Disciplina, {
      where: { id },
      relations: ['assuntos'],
    });

    // Determinar a disciplina raiz
    const idOrigem = disciplina.disciplinaOrigemId || disciplina.id;

    // Buscar a última versão para incrementar
    const ultimaVersao = await queryRunner.manager
      .createQueryBuilder(Disciplina, 'disciplina')
      .where('disciplina.id = :idOrigem OR disciplina.disciplinaOrigemId = :idOrigem', { idOrigem })
      .orderBy('disciplina.versao', 'DESC')
      .getOne();

    const novaVersao = ultimaVersao ? ultimaVersao.versao + 1 : 1;

    // Criar a nova versão da disciplina
    const nomeBase = dadosAtualizacao.nome || disciplina.nome;
    const nomeFormatado = `${nomeBase} (editada) v${novaVersao}`;

    const novaDisciplina = queryRunner.manager.create(Disciplina, {
      nome: nomeFormatado,
      descricao: dadosAtualizacao.descricao || disciplina.descricao,
      versao: novaVersao,
      ativa: true, // Novas versões sempre ativas
      disciplinaOrigemId: idOrigem,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await queryRunner.manager.save(novaDisciplina);

    // Copiar os assuntos
    if (dadosAtualizacao.assuntos && Array.isArray(dadosAtualizacao.assuntos) && dadosAtualizacao.assuntos.length > 0) {
      const assuntosData = dadosAtualizacao.assuntos.map(assunto => ({
        nome: assunto.nome,
        disciplinaId: novaDisciplina.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queryRunner.manager.save(Assunto, assuntosData);
    } else if (disciplina.assuntos && disciplina.assuntos.length > 0) {
      // Se não foram fornecidos novos assuntos, copiar os antigos
      const assuntosData = disciplina.assuntos.map(assunto => ({
        nome: assunto.nome,
        disciplinaId: novaDisciplina.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queryRunner.manager.save(Assunto, assuntosData);
    }
  }
}
