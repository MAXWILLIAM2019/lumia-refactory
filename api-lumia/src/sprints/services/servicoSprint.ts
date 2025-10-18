import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { SprintMestre } from '../entities/sprintMestre.entity';
import { Sprint } from '../entities/sprint.entity';
import { MetaMestre } from '../../metas/entities/metaMestre.entity';
import { Meta } from '../../metas/entities/meta.entity';
import { PlanoMestre } from '../../planos/entities/planoMestre.entity';
import { Plano } from '../../planos/entities/plano.entity';
import { PlanoMestreDisciplina } from '../../planos/entities/planoMestreDisciplina.entity';
import { Disciplina } from '../../disciplinas/entities/disciplina.entity';
import { Assunto } from '../../disciplinas/entities/assunto.entity';
import { CriarSprintMestreDto } from '../dto/criarSprintMestre.dto';
import { AtualizarSprintMestreDto } from '../dto/atualizarSprintMestre.dto';
import { AtualizarMetaDto } from '../dto/atualizarMeta.dto';
import { ReordenarSprintsDto } from '../dto/reordenarSprints.dto';
import { AdicionarMetasDto } from '../dto/adicionarMetas.dto';
import { StatusMeta } from '../../common/enums/statusMeta.enum';

@Injectable()
export class ServicoSprint {
  constructor(
    @InjectRepository(SprintMestre)
    private sprintMestreRepository: Repository<SprintMestre>,
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(MetaMestre)
    private metaMestreRepository: Repository<MetaMestre>,
    @InjectRepository(Meta)
    private metaRepository: Repository<Meta>,
    @InjectRepository(PlanoMestre)
    private planoMestreRepository: Repository<PlanoMestre>,
    @InjectRepository(Plano)
    private planoRepository: Repository<Plano>,
    @InjectRepository(PlanoMestreDisciplina)
    private planoMestreDisciplinaRepository: Repository<PlanoMestreDisciplina>,
    @InjectRepository(Disciplina)
    private disciplinaRepository: Repository<Disciplina>,
    @InjectRepository(Assunto)
    private assuntoRepository: Repository<Assunto>,
    private dataSource: DataSource,
  ) {}

  // ===== MÉTODOS PARA SPRINT MESTRE (TEMPLATES) =====

  async criarSprintMestre(dadosSprint: CriarSprintMestreDto): Promise<SprintMestre> {
    return await this.dataSource.transaction(async (manager) => {
      // Verificar se o plano mestre existe
      const planoMestre = await manager.findOne(PlanoMestre, {
        where: { id: dadosSprint.planoId },
      });

      if (!planoMestre) {
        throw new NotFoundException('Plano mestre não encontrado');
      }

      // Validar disciplinas e assuntos das metas se houver metas
      if (dadosSprint.metas && dadosSprint.metas.length > 0) {
        await this.validarDisciplinasDasMetas(dadosSprint.planoId, dadosSprint.metas);
      }

      // Determinar a próxima posição disponível para este plano mestre
      const ultimaSprintMestre = await manager.findOne(SprintMestre, {
        where: { planoMestreId: dadosSprint.planoId },
        order: { posicao: 'DESC' },
      });

      const proximaPosicao = ultimaSprintMestre ? ultimaSprintMestre.posicao + 1 : 1;

      // Criar a sprint mestre
      const sprintMestre = manager.create(SprintMestre, {
        nome: dadosSprint.nome,
        dataInicio: dadosSprint.dataInicio ? new Date(dadosSprint.dataInicio) : null,
        dataFim: dadosSprint.dataFim ? new Date(dadosSprint.dataFim) : null,
        planoMestreId: dadosSprint.planoId,
        posicao: proximaPosicao,
        status: StatusMeta.PENDENTE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const sprintMestreSalva = await manager.save(SprintMestre, sprintMestre);

      // Criar as metas mestre associadas à sprint mestre
      if (dadosSprint.metas && dadosSprint.metas.length > 0) {
        for (const [index, meta] of dadosSprint.metas.entries()) {
          // Se a posição não foi fornecida ou é 0, usar o índice + 1
          const posicao = meta.posicao && meta.posicao > 0 ? meta.posicao : index + 1;

          // Buscar nomes e IDs por códigos
          const { disciplina, assunto, disciplinaId, assuntoId } = await this.validarCodigosMeta(meta.codigoDisciplina, meta.codigoAssunto);

          const novaMetaMestre = manager.create(MetaMestre, {
            disciplinaId: disciplinaId,
            disciplina: disciplina,
            tipo: meta.tipo,
            assuntoId: assuntoId,
            assunto: assunto,
            comandos: meta.comandos || '',
            link: meta.link || '',
            relevancia: meta.relevancia,
            tempoEstudado: '00:00',
            desempenho: 0,
            status: StatusMeta.PENDENTE,
            totalQuestoes: 0,
            questoesCorretas: 0,
            sprintMestreId: sprintMestreSalva.id,
            posicao: posicao,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          await manager.save(MetaMestre, novaMetaMestre);
        }
      }

      return sprintMestreSalva;
    });
  }

  async listarSprintsMestre(): Promise<SprintMestre[]> {
    return await this.sprintMestreRepository.find({
      relations: ['metasMestre', 'planoMestre'],
      order: { posicao: 'ASC' },
    });
  }

  async buscarSprintMestrePorId(id: number): Promise<SprintMestre> {
    const sprintMestre = await this.sprintMestreRepository.findOne({
      where: { id },
      relations: ['metasMestre', 'planoMestre'],
    });

    if (!sprintMestre) {
      throw new NotFoundException('Sprint mestre não encontrada');
    }

    return sprintMestre;
  }

  async atualizarSprintMestre(id: number, dadosAtualizacao: AtualizarSprintMestreDto): Promise<SprintMestre> {
    const sprintMestre = await this.buscarSprintMestrePorId(id);

    // Atualizar dados da sprint mestre
    if (dadosAtualizacao.nome) sprintMestre.nome = dadosAtualizacao.nome;
    if (dadosAtualizacao.dataInicio) sprintMestre.dataInicio = new Date(dadosAtualizacao.dataInicio);
    if (dadosAtualizacao.dataFim) sprintMestre.dataFim = new Date(dadosAtualizacao.dataFim);
    if (dadosAtualizacao.planoId) sprintMestre.planoMestreId = dadosAtualizacao.planoId;
    
    sprintMestre.updatedAt = new Date();

    const sprintMestreAtualizada = await this.sprintMestreRepository.save(sprintMestre);

    // Atualizar metas mestre se fornecidas
    if (dadosAtualizacao.metas) {
      await this.atualizarMetasMestre(sprintMestre.id, dadosAtualizacao.metas);
    }

    return await this.buscarSprintMestrePorId(id);
  }

  async removerSprintMestre(id: number): Promise<void> {
    const sprintMestre = await this.buscarSprintMestrePorId(id);

    // Deletar metas mestre associadas
    await this.metaMestreRepository.delete({ sprintMestreId: sprintMestre.id });

    // Deletar sprint mestre
    await this.sprintMestreRepository.remove(sprintMestre);
  }

  async reordenarSprints(dadosReordenacao: ReordenarSprintsDto): Promise<SprintMestre[]> {
    const { planoId, ordemSprints } = dadosReordenacao;

    // Verificar se o plano mestre existe
    const planoMestre = await this.planoMestreRepository.findOne({
      where: { id: planoId },
    });

    if (!planoMestre) {
      throw new NotFoundException('Plano mestre não encontrado');
    }

    // Verificar se todas as sprints mestre pertencem ao plano mestre
    const sprintsMestre = await this.sprintMestreRepository.find({
      where: { planoMestreId: planoId },
    });

    const sprintMestreIds = sprintsMestre.map(s => s.id);

    for (const id of ordemSprints) {
      if (!sprintMestreIds.includes(id)) {
        throw new BadRequestException(`Sprint com ID ${id} não pertence ao plano ${planoId}`);
      }
    }

    // Verificar se todos os IDs de sprints mestre do plano estão na ordemSprints
    if (new Set([...sprintMestreIds]).size !== new Set([...ordemSprints]).size) {
      throw new BadRequestException('A lista de sprints fornecida não contém todas as sprints do plano');
    }

    // Atualizar posições
    for (let i = 0; i < ordemSprints.length; i++) {
      await this.sprintMestreRepository.update(
        { id: ordemSprints[i] },
        { posicao: i + 1, updatedAt: new Date() }
      );
    }

    // Retornar as sprints mestre reordenadas
    return await this.sprintMestreRepository.find({
      where: { planoMestreId: planoId },
      relations: ['metasMestre', 'planoMestre'],
      order: { posicao: 'ASC' },
    });
  }

  async adicionarMetas(sprintMestreId: number, dadosMetas: AdicionarMetasDto): Promise<SprintMestre> {
    const { metas } = dadosMetas;

    // Validar se a sprint mestre existe
    const sprintMestre = await this.buscarSprintMestrePorId(sprintMestreId);

    // Validar se existem posições repetidas na planilha
    const posicoesNasPlanilha = metas.map(meta => meta.posicao);
    const posicoesUnicas = new Set(posicoesNasPlanilha);
    
    if (posicoesNasPlanilha.length !== posicoesUnicas.size) {
      // Encontrar as posições que se repetem
      const posicoesRepetidas = posicoesNasPlanilha.filter(
        (posicao, index) => posicoesNasPlanilha.indexOf(posicao) !== index
      );
      
      throw new BadRequestException(`Existem posições repetidas na planilha: ${posicoesRepetidas.join(', ')}. Cada meta deve ter uma posição única.`);
    }

    // Obter posições já utilizadas na sprint
    const posicoesExistentes = new Set(sprintMestre.metasMestre.map(meta => meta.posicao));

    // Validar se alguma posição já está em uso na sprint
    for (const meta of metas) {
      if (posicoesExistentes.has(meta.posicao)) {
        throw new BadRequestException(`A posição ${meta.posicao} já está em uso nesta sprint. Cada meta deve ter uma posição única.`);
      }
    }

    // Criar as novas metas mestre
    const novasMetasMestre = await Promise.all(metas.map(async meta => {
      // Buscar nomes e IDs por códigos
      const { disciplina, assunto, disciplinaId, assuntoId } = await this.validarCodigosMeta(meta.codigoDisciplina, meta.codigoAssunto);

      const novaMetaMestre = this.metaMestreRepository.create({
        disciplinaId: disciplinaId,
        disciplina: disciplina,
        tipo: meta.tipo,
        assuntoId: assuntoId,
        assunto: assunto,
        comandos: meta.comandos || '',
        link: meta.link || '',
        relevancia: meta.relevancia,
        tempoEstudado: '00:00',
        desempenho: 0,
        status: StatusMeta.PENDENTE,
        totalQuestoes: 0,
        questoesCorretas: 0,
        sprintMestreId: sprintMestre.id,
        posicao: meta.posicao,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return await this.metaMestreRepository.save(novaMetaMestre);
    }));

    // Propagação automática das novas metas para todas as sprints instanciadas
    // Buscar todas as sprints instanciadas desta sprint mestre
    const sprintsInstanciadas = await this.sprintRepository.find({
      where: { sprintMestreId: sprintMestreId },
    });

    // Criar as novas metas em cada sprint instanciada
    for (const sprint of sprintsInstanciadas) {
      for (const metaMestre of novasMetasMestre) {
        const novaMeta = this.metaRepository.create({
          disciplina: metaMestre.disciplina,
          tipo: metaMestre.tipo,
          assunto: metaMestre.assunto,
          comandos: metaMestre.comandos,
          link: metaMestre.link,
          relevancia: metaMestre.relevancia,
          tempoEstudado: '00:00',
          desempenho: 0,
          status: StatusMeta.PENDENTE,
          totalQuestoes: 0,
          questoesCorretas: 0,
          sprintId: sprint.id,
          posicao: metaMestre.posicao,
          metaMestreId: metaMestre.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await this.metaRepository.save(novaMeta);
      }
    }

    return await this.buscarSprintMestrePorId(sprintMestreId);
  }

  // ===== MÉTODOS PARA META MESTRE =====

  async atualizarMetaMestre(id: number, dadosAtualizacao: AtualizarMetaDto): Promise<MetaMestre> {
    const metaMestre = await this.metaMestreRepository.findOne({
      where: { id },
    });

    if (!metaMestre) {
      throw new NotFoundException('Meta mestre não encontrada');
    }

    Object.assign(metaMestre, dadosAtualizacao);
    metaMestre.updatedAt = new Date();

    return await this.metaMestreRepository.save(metaMestre);
  }

  // ===== MÉTODOS PARA META (INSTÂNCIA) =====

  async atualizarMetaInstancia(id: number, dadosAtualizacao: AtualizarMetaDto): Promise<Meta> {
    const meta = await this.metaRepository.findOne({
      where: { id },
      relations: ['sprint'],
    });

    if (!meta) {
      throw new NotFoundException('Meta não encontrada');
    }

    // Lógica inteligente: se forneceu tempoEstudado, totalQuestoes E questoesCorretas,
    // calcular automaticamente o desempenho e marcar como concluída
    const camposParaConclusaoAutomatica = [
      dadosAtualizacao.tempoEstudado,
      dadosAtualizacao.totalQuestoes,
      dadosAtualizacao.questoesCorretas
    ];

    const todosCamposFornecidos = camposParaConclusaoAutomatica.every(
      campo => campo !== undefined && campo !== null
    );

    if (todosCamposFornecidos && dadosAtualizacao.totalQuestoes > 0) {
      // Calcular desempenho automaticamente
      const desempenhoCalculado = (dadosAtualizacao.questoesCorretas / dadosAtualizacao.totalQuestoes) * 100;

      // Adicionar cálculos automáticos aos dados de atualização
      dadosAtualizacao.desempenho = Math.round(desempenhoCalculado * 100) / 100; // 2 casas decimais
      dadosAtualizacao.status = StatusMeta.CONCLUIDA;
    }

    Object.assign(meta, dadosAtualizacao);
    meta.updatedAt = new Date();

    const metaAtualizada = await this.metaRepository.save(meta);

    // Se a meta foi concluída (manualmente ou automaticamente), verificar se todas as metas da sprint foram concluídas
    // ou se é a primeira meta concluída para atualizar o status da sprint
    if (dadosAtualizacao.status === StatusMeta.CONCLUIDA || metaAtualizada.status === StatusMeta.CONCLUIDA) {
      await this.atualizarStatusSprint(meta.sprint.id);
    }

    return metaAtualizada;
  }

  // ===== MÉTODOS PARA SPRINT (INSTÂNCIA) =====

  async buscarSprintsInstanciadasPorPlano(planoId: number): Promise<Sprint[]> {
    // Verificar se o plano existe
    const plano = await this.planoRepository.findOne({
      where: { id: planoId },
    });

    if (!plano) {
      throw new NotFoundException('Plano não encontrado');
    }

    // Buscar sprints do plano com suas metas
    return await this.sprintRepository.find({
      where: { planoId: planoId },
      relations: ['metas', 'plano'],
      order: { posicao: 'ASC' },
    });
  }

  // ===== MÉTODOS AUXILIARES =====

  private async atualizarMetasMestre(sprintMestreId: number, metas: any[]): Promise<void> {
    // Buscar metas mestre existentes
    const metasMestreExistentes = await this.metaMestreRepository.find({
      where: { sprintMestreId: sprintMestreId },
    });

    // Mapear metas existentes por ID para fácil acesso
    const metasExistentesMap = new Map(
      metasMestreExistentes.map(meta => [meta.id, meta])
    );

    // Array para armazenar os IDs das metas que serão mantidas
    const idsMetasManter = [];

    // Processar cada meta da requisição
    for (const meta of metas) {
      if (meta.id && metasExistentesMap.has(meta.id)) {
        // Se a meta mestre já existe, atualizar
        const metaExistente = metasExistentesMap.get(meta.id);
        Object.assign(metaExistente, meta);
        metaExistente.updatedAt = new Date();
        await this.metaMestreRepository.save(metaExistente);
        idsMetasManter.push(meta.id);
      } else if (!meta.id) {
        // Se é uma nova meta mestre (sem ID), criar
        const novaMetaMestre = await this.metaMestreRepository.save({
          ...meta,
          sprintMestreId: sprintMestreId,
          tempoEstudado: meta.tempoEstudado || '00:00',
          desempenho: meta.desempenho || 0,
          status: meta.status || StatusMeta.PENDENTE,
          totalQuestoes: meta.totalQuestoes || 0,
          questoesCorretas: meta.questoesCorretas || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        idsMetasManter.push(novaMetaMestre.id);
      }
    }

    // Remover apenas as metas que não estão mais presentes na requisição
    if (idsMetasManter.length > 0) {
      await this.metaMestreRepository.delete({
        sprintMestreId: sprintMestreId,
        id: In(metasMestreExistentes.filter(m => !idsMetasManter.includes(m.id)).map(m => m.id)),
      });
    }
  }

  private async atualizarStatusSprint(sprintId: number): Promise<void> {
    const sprint = await this.sprintRepository.findOne({
      where: { id: sprintId },
      relations: ['metas'],
    });

    if (sprint) {
      const todasMetasConcluidas = sprint.metas.every(m => m.status === StatusMeta.CONCLUIDA);
      
      if (todasMetasConcluidas) {
        await this.sprintRepository.update(sprintId, { 
          status: StatusMeta.CONCLUIDA,
          updatedAt: new Date(),
        });
      } else if (sprint.status === StatusMeta.PENDENTE) {
        // Se a sprint está pendente e temos uma meta concluída, mudar para Em Andamento
        await this.sprintRepository.update(sprintId, { 
          status: StatusMeta.EM_ANDAMENTO,
          updatedAt: new Date(),
        });
      }
    }
  }

  // ===== MÉTODOS AUXILIARES PARA VALIDAÇÃO =====

  /**
   * Busca as disciplinas disponíveis em um plano mestre
   */
  private async buscarDisciplinasDoPlano(planoMestreId: number): Promise<string[]> {
    const associacoes = await this.planoMestreDisciplinaRepository.find({
      where: { planoMestreId },
      relations: ['disciplina'],
    });

    return associacoes.map(a => a.disciplina.nome);
  }

  /**
   * Valida se os códigos de disciplina e assunto existem
   */
  private async validarCodigosMeta(codigoDisciplina: string, codigoAssunto: string): Promise<{disciplina: string, assunto: string, disciplinaId: number, assuntoId: number}> {
    // Buscar disciplina por código
    const disciplina = await this.disciplinaRepository.findOne({
      where: { codigo: codigoDisciplina, ativa: true }
    });

    if (!disciplina) {
      throw new BadRequestException(`Disciplina com código '${codigoDisciplina}' não encontrada ou inativa`);
    }

    // Buscar assunto por código (apenas ativos)
    let assunto = await this.assuntoRepository.findOne({
      where: { codigo: codigoAssunto, disciplinaId: disciplina.id, ativo: true }
    });

    // Se não encontrou assunto ativo, verificar se existe inativo mas usado em MetasMestre
    if (!assunto) {
      const assuntoInativo = await this.assuntoRepository.findOne({
        where: { codigo: codigoAssunto, disciplinaId: disciplina.id }
      });

      if (assuntoInativo) {
        // Verificar se o assunto inativo está sendo usado em MetasMestre
        const usoEmMetasMestre = await this.metaMestreRepository.count({
          where: { assuntoId: assuntoInativo.id }
        });

        if (usoEmMetasMestre > 0) {
          // Permitir uso de assunto inativo se já está em templates de plano
          assunto = assuntoInativo;
        }
      }
    }

    if (!assunto) {
      throw new BadRequestException(`Assunto com código '${codigoAssunto}' não encontrado ou não pertence à disciplina '${disciplina.nome}'`);
    }

    return {
      disciplina: disciplina.nome,
      assunto: assunto.nome,
      disciplinaId: disciplina.id,
      assuntoId: assunto.id
    };
  }

  /**
   * Valida se as disciplinas das metas estão disponíveis no plano
   */
  private async validarDisciplinasDasMetas(planoMestreId: number, metas: any[]): Promise<void> {
    const disciplinasDisponiveis = await this.buscarDisciplinasDoPlano(planoMestreId);

    for (const meta of metas) {
      // Primeiro validar se os códigos existem
      const { disciplina } = await this.validarCodigosMeta(meta.codigoDisciplina, meta.codigoAssunto);

      // Depois validar se a disciplina está disponível no plano
      if (!disciplinasDisponiveis.includes(disciplina)) {
        throw new BadRequestException(
          `Disciplina '${disciplina}' não está disponível neste plano. Disciplinas disponíveis: ${disciplinasDisponiveis.join(', ')}`
        );
      }
    }
  }
}
