import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PlanoMestre } from '../entities/planoMestre.entity';
import { Plano } from '../entities/plano.entity';
import { AlunoPlanos } from '../entities/alunoPlanos.entity';
import { PlanoDisciplina } from '../entities/planoDisciplina.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Disciplina } from '../../disciplinas/entities/disciplina.entity';
import { CriarPlanoMestreDto } from '../dto/criarPlanoMestre.dto';
import { AtualizarPlanoMestreDto } from '../dto/atualizarPlanoMestre.dto';
import { CriarPlanoDto } from '../dto/criarPlano.dto';
import { AtualizarPlanoDto } from '../dto/atualizarPlano.dto';
import { AssociarAlunoPlanoDto } from '../dto/associarAlunoPlano.dto';
import { AssociarDisciplinaPlanoDto } from '../dto/associarDisciplinaPlanoDto';
import { StatusPlano } from '../../common/enums/statusPlano.enum';

@Injectable()
export class ServicoPlano {
  constructor(
    @InjectRepository(PlanoMestre)
    private planoMestreRepository: Repository<PlanoMestre>,
    @InjectRepository(Plano)
    private planoRepository: Repository<Plano>,
    @InjectRepository(AlunoPlanos)
    private alunoPlanosRepository: Repository<AlunoPlanos>,
    @InjectRepository(PlanoDisciplina)
    private planoDisciplinaRepository: Repository<PlanoDisciplina>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Disciplina)
    private disciplinaRepository: Repository<Disciplina>,
  ) {}

  // ===== MÉTODOS PARA PLANO MESTRE (TEMPLATES) =====

  async criarPlanoMestre(dadosPlanoMestre: CriarPlanoMestreDto): Promise<PlanoMestre> {
    const planoMestre = this.planoMestreRepository.create({
      nome: dadosPlanoMestre.nome,
      cargo: dadosPlanoMestre.cargo,
      descricao: dadosPlanoMestre.descricao,
      duracao: dadosPlanoMestre.duracao,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.planoMestreRepository.save(planoMestre);
  }

  async listarPlanosMestre(): Promise<PlanoMestre[]> {
    return await this.planoMestreRepository.find({
      where: { ativo: true },
      order: { createdAt: 'DESC' },
    });
  }

  async buscarPlanoMestrePorId(id: number): Promise<PlanoMestre> {
    const planoMestre = await this.planoMestreRepository.findOne({
      where: { id, ativo: true },
      relations: ['sprintsMestre'],
    });

    if (!planoMestre) {
      throw new NotFoundException('Plano mestre não encontrado');
    }

    return planoMestre;
  }

  async atualizarPlanoMestre(id: number, dadosAtualizacao: AtualizarPlanoMestreDto): Promise<PlanoMestre> {
    const planoMestre = await this.buscarPlanoMestrePorId(id);

    if (dadosAtualizacao.nome) planoMestre.nome = dadosAtualizacao.nome;
    if (dadosAtualizacao.cargo) planoMestre.cargo = dadosAtualizacao.cargo;
    if (dadosAtualizacao.descricao) planoMestre.descricao = dadosAtualizacao.descricao;
    if (dadosAtualizacao.duracao) planoMestre.duracao = dadosAtualizacao.duracao;
    
    planoMestre.updatedAt = new Date();

    return await this.planoMestreRepository.save(planoMestre);
  }

  async desativarPlanoMestre(id: number): Promise<void> {
    const planoMestre = await this.buscarPlanoMestrePorId(id);
    
    planoMestre.ativo = false;
    planoMestre.updatedAt = new Date();

    await this.planoMestreRepository.save(planoMestre);
  }

  // ===== MÉTODOS PARA PLANO (INSTÂNCIAS) =====

  async criarPlano(dadosPlano: CriarPlanoDto): Promise<Plano> {
    // Validação dos dados obrigatórios
    if (!dadosPlano.planoMestreId || !dadosPlano.alunoId) {
      throw new BadRequestException('planoMestreId e alunoId são obrigatórios');
    }

    // Verifica se o plano mestre existe
    const planoMestre = await this.buscarPlanoMestrePorId(dadosPlano.planoMestreId);

    // Verifica se o aluno existe
    const aluno = await this.usuarioRepository.findOne({
      where: { id: dadosPlano.alunoId },
      relations: ['grupo'],
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    if (aluno.grupo.nome !== 'aluno') {
      throw new BadRequestException('Usuário deve ser um aluno');
    }

    // Verifica se o aluno já tem um plano ativo e cancela se necessário
    const planoExistente = await this.alunoPlanosRepository.findOne({
      where: {
        usuarioId: dadosPlano.alunoId,
        ativo: true,
      },
    });

    if (planoExistente) {
      // Cancela o plano existente
      await this.alunoPlanosRepository.update(
        { usuarioId: dadosPlano.alunoId, planoId: planoExistente.planoId },
        { 
          ativo: false,
          status: StatusPlano.CANCELADO,
          observacoes: (planoExistente.observacoes || '') + 
                      '\nPlano substituído por um novo em ' + new Date().toISOString().split('T')[0],
          updatedAt: new Date(),
        }
      );
    }

    // Verifica se já existe associação para este par usuário/plano
    const associacaoExistente = await this.alunoPlanosRepository.findOne({
      where: {
        usuarioId: dadosPlano.alunoId,
        planoId: dadosPlano.planoMestreId, // Verifica se já existe instância deste template
      },
    });

    if (associacaoExistente) {
      throw new ConflictException('Este usuário já está associado a este plano');
    }

    // Cria o plano baseado no template
    const plano = this.planoRepository.create({
      nome: planoMestre.nome,
      cargo: planoMestre.cargo,
      descricao: planoMestre.descricao || `Plano personalizado baseado em: ${planoMestre.nome}`,
      duracao: planoMestre.duracao,
      planoMestreId: planoMestre.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const planoSalvo = await this.planoRepository.save(plano);

    // Calcula data prevista de término baseada na duração do plano
    let dataPrevisaoTermino = null;
    if (planoMestre.duracao) {
      const dataBase = dadosPlano.dataInicio ? new Date(dadosPlano.dataInicio) : new Date();
      dataPrevisaoTermino = new Date(dataBase);
      dataPrevisaoTermino.setMonth(dataPrevisaoTermino.getMonth() + planoMestre.duracao);
    }

    // Cria a associação aluno-plano
    await this.alunoPlanosRepository.save({
      usuarioId: dadosPlano.alunoId,
      planoId: planoSalvo.id,
      dataInicio: dadosPlano.dataInicio ? new Date(dadosPlano.dataInicio) : new Date(),
      dataPrevisaoTermino: dadosPlano.dataConclusaoEsperada ? new Date(dadosPlano.dataConclusaoEsperada) : dataPrevisaoTermino,
      observacoes: dadosPlano.observacoes || '',
      status: StatusPlano.NAO_INICIADO,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return planoSalvo;
  }

  async listarPlanos(): Promise<Plano[]> {
    return await this.planoRepository.find({
      relations: ['planoMestre'],
      order: { createdAt: 'DESC' },
    });
  }

  async buscarPlanoPorId(id: number): Promise<Plano> {
    const plano = await this.planoRepository.findOne({
      where: { id },
      relations: ['planoMestre'],
    });

    if (!plano) {
      throw new NotFoundException('Plano não encontrado');
    }

    return plano;
  }

  async atualizarPlano(id: number, dadosAtualizacao: AtualizarPlanoDto): Promise<Plano> {
    const plano = await this.buscarPlanoPorId(id);

    if (dadosAtualizacao.dataInicio) {
      // Atualizar data de início na associação aluno-plano
      await this.alunoPlanosRepository.update(
        { planoId: id },
        { dataInicio: new Date(dadosAtualizacao.dataInicio) }
      );
    }

    plano.updatedAt = new Date();

    return await this.planoRepository.save(plano);
  }

  async alterarStatusPlano(id: number, status: StatusPlano): Promise<Plano> {
    const plano = await this.buscarPlanoPorId(id);

    // Atualiza o status na associação aluno-plano
    await this.alunoPlanosRepository.update(
      { planoId: id },
      { 
        status,
        updatedAt: new Date(),
        ...(status === StatusPlano.EM_ANDAMENTO && { dataInicio: new Date() }),
        ...(status === StatusPlano.CONCLUIDO && { dataConclusao: new Date() }),
      }
    );

    plano.updatedAt = new Date();

    return await this.planoRepository.save(plano);
  }

  // ===== MÉTODOS PARA ASSOCIAÇÃO ALUNO-PLANO =====

  async associarAlunoPlano(dadosAssociacao: AssociarAlunoPlanoDto): Promise<AlunoPlanos> {
    // Verifica se o aluno existe
    const aluno = await this.usuarioRepository.findOne({
      where: { id: dadosAssociacao.alunoId },
      relations: ['grupo'],
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    if (aluno.grupo.nome !== 'aluno') {
      throw new BadRequestException('Usuário deve ser um aluno');
    }

    // Verifica se o plano existe
    const plano = await this.buscarPlanoPorId(dadosAssociacao.planoId);

    // Verifica se já existe associação ativa
    const associacaoExistente = await this.alunoPlanosRepository.findOne({
      where: {
        usuarioId: dadosAssociacao.alunoId,
        planoId: dadosAssociacao.planoId,
      },
    });

    if (associacaoExistente) {
      throw new ConflictException('Aluno já está associado a este plano');
    }

    const associacao = this.alunoPlanosRepository.create({
      usuarioId: dadosAssociacao.alunoId,
      planoId: dadosAssociacao.planoId,
      dataInicio: dadosAssociacao.dataInicio ? new Date(dadosAssociacao.dataInicio) : new Date(),
      dataPrevisaoTermino: dadosAssociacao.dataConclusaoEsperada ? new Date(dadosAssociacao.dataConclusaoEsperada) : null,
      observacoes: dadosAssociacao.observacoes,
      status: StatusPlano.NAO_INICIADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.alunoPlanosRepository.save(associacao);
  }

  async listarPlanosDoAluno(alunoId: number): Promise<AlunoPlanos[]> {
    return await this.alunoPlanosRepository.find({
      where: { usuarioId: alunoId },
      relations: ['plano', 'plano.planoMestre'],
      order: { createdAt: 'DESC' },
    });
  }

  async removerAssociacaoAlunoPlano(alunoId: number, planoId: number): Promise<void> {
    const associacao = await this.alunoPlanosRepository.findOne({
      where: { usuarioId: alunoId, planoId },
    });

    if (!associacao) {
      throw new NotFoundException('Associação não encontrada');
    }

    await this.alunoPlanosRepository.remove(associacao);
  }

  // ===== MÉTODOS ESPECÍFICOS DO SISTEMA =====

  async buscarPlanoDoAlunoLogado(alunoId: number): Promise<AlunoPlanos> {
    const associacao = await this.alunoPlanosRepository.findOne({
      where: { 
        usuarioId: alunoId,
        ativo: true,
      },
      relations: ['plano', 'plano.planoMestre'],
    });

    if (!associacao) {
      throw new NotFoundException('Você não possui planos de estudo atribuídos');
    }

    return associacao;
  }

  async atualizarProgressoAluno(alunoId: number, planoId: number, dadosProgresso: {
    progresso?: number;
    status?: StatusPlano;
    observacoes?: string;
  }): Promise<AlunoPlanos> {
    const associacao = await this.alunoPlanosRepository.findOne({
      where: { usuarioId: alunoId, planoId },
    });

    if (!associacao) {
      throw new NotFoundException('Associação aluno-plano não encontrada');
    }

    const dadosAtualizacao: any = { updatedAt: new Date() };

    if (dadosProgresso.progresso !== undefined) {
      dadosAtualizacao.progresso = dadosProgresso.progresso;
    }

    if (dadosProgresso.status) {
      dadosAtualizacao.status = dadosProgresso.status;
      if (dadosProgresso.status === StatusPlano.CONCLUIDO && !associacao.dataConclusao) {
        dadosAtualizacao.dataConclusao = new Date();
      }
    }

    if (dadosProgresso.observacoes !== undefined) {
      dadosAtualizacao.observacoes = dadosProgresso.observacoes;
    }

    await this.alunoPlanosRepository.update(
      { usuarioId: alunoId, planoId },
      dadosAtualizacao
    );

    return await this.alunoPlanosRepository.findOne({
      where: { usuarioId: alunoId, planoId },
      relations: ['plano', 'plano.planoMestre'],
    });
  }

  // ===== MÉTODOS DE ESTATÍSTICAS =====

  async obterEstatisticasPlanos(): Promise<{
    totalPlanosMestre: number;
    totalPlanosAtivos: number;
    totalPlanosConcluidos: number;
    totalAlunosComPlanos: number;
  }> {
    const [
      totalPlanosMestre,
      totalPlanosAtivos,
      totalPlanosConcluidos,
      totalAlunosComPlanos,
    ] = await Promise.all([
      this.planoMestreRepository.count({ where: { ativo: true } }),
      this.alunoPlanosRepository.count({ where: { status: StatusPlano.EM_ANDAMENTO } }),
      this.alunoPlanosRepository.count({ where: { status: StatusPlano.CONCLUIDO } }),
      this.alunoPlanosRepository
        .createQueryBuilder('ap')
        .select('COUNT(DISTINCT ap.usuarioId)', 'count')
        .getRawOne(),
    ]);

    return {
      totalPlanosMestre,
      totalPlanosAtivos,
      totalPlanosConcluidos,
      totalAlunosComPlanos: parseInt(totalAlunosComPlanos.count),
    };
  }

  // ===== MÉTODOS PARA GERENCIAR DISCIPLINAS DE UM PLANO =====

  /**
   * Associa disciplinas a um plano
   */
  async associarDisciplinasAoPlano(
    planoId: number,
    dadosAssociacao: AssociarDisciplinaPlanoDto,
  ): Promise<void> {
    // Verificar se o plano existe
    const plano = await this.planoRepository.findOne({
      where: { id: planoId },
    });

    if (!plano) {
      throw new NotFoundException(`Plano com ID ${planoId} não encontrado`);
    }

    // Verificar se todas as disciplinas existem
    const disciplinas = await this.disciplinaRepository.find({
      where: { id: In(dadosAssociacao.disciplinaIds) },
    });

    if (disciplinas.length !== dadosAssociacao.disciplinaIds.length) {
      throw new BadRequestException('Uma ou mais disciplinas não foram encontradas');
    }

    // Criar as associações
    const agora = new Date();
    const associacoes = disciplinas.map(disciplina => ({
      planoId: plano.id,
      disciplinaId: disciplina.id,
      createdAt: agora,
      updatedAt: agora,
    }));

    // Remover associações existentes para evitar duplicatas
    await this.planoDisciplinaRepository.delete({ planoId: plano.id });

    // Salvar novas associações
    await this.planoDisciplinaRepository.save(associacoes);
  }

  /**
   * Lista as disciplinas associadas a um plano
   */
  async listarDisciplinasDoPlano(planoId: number): Promise<Disciplina[]> {
    // Verificar se o plano existe
    const plano = await this.planoRepository.findOne({
      where: { id: planoId },
    });

    if (!plano) {
      throw new NotFoundException(`Plano com ID ${planoId} não encontrado`);
    }

    // Buscar as associações com disciplinas
    const associacoes = await this.planoDisciplinaRepository.find({
      where: { planoId },
      relations: ['disciplina', 'disciplina.assuntos'],
    });

    // Extrair as disciplinas das associações
    return associacoes.map(associacao => associacao.disciplina);
  }

  /**
   * Remove uma disciplina de um plano
   */
  async removerDisciplinaDoPlano(planoId: number, disciplinaId: number): Promise<void> {
    // Verificar se a associação existe
    const associacao = await this.planoDisciplinaRepository.findOne({
      where: { planoId, disciplinaId },
    });

    if (!associacao) {
      throw new NotFoundException(`Disciplina não está associada ao plano`);
    }

    // Remover a associação
    await this.planoDisciplinaRepository.remove(associacao);
  }
}
