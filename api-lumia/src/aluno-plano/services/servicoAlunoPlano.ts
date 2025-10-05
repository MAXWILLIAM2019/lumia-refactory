import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AlunoPlano } from '../entities/alunoPlano.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Plano } from '../../planos/entities/plano.entity';
import { AtribuirPlanoAlunoDto } from '../dto/atribuirPlanoAluno.dto';
import { AtualizarProgressoDto } from '../dto/atualizarProgresso.dto';
import { RemoverAssociacaoDto } from '../dto/removerAssociacao.dto';

@Injectable()
export class ServicoAlunoPlano {
  constructor(
    @InjectRepository(AlunoPlano)
    private alunoPlanoRepository: Repository<AlunoPlano>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Plano)
    private planoRepository: Repository<Plano>,
    private dataSource: DataSource,
  ) {}

  /**
   * ATENÇÃO: Método testado e funcional - Não alterar sem consulta!
   * 
   * Atribui um plano a um aluno
   * 
   * Fluxo de execução:
   * 1. Valida existência do usuário e plano
   * 2. Verifica se o usuário já tem plano ativo
   *    - Se sim, cancela o plano existente antes de prosseguir
   * 3. Verifica se já existe associação para este par usuário/plano
   * 4. Calcula data prevista de término baseada na duração do plano
   * 5. Cria nova associação com ativo = true
   */
  async atribuirPlanoAluno(atribuirPlanoAlunoDto: AtribuirPlanoAlunoDto): Promise<AlunoPlano> {
    const { idusuario, planoId, dataInicio, dataPrevisaoTermino, status, observacoes } = atribuirPlanoAlunoDto;

    return await this.dataSource.transaction(async (manager) => {
      // Verificar se o usuário existe
      const usuario = await manager.findOne(Usuario, { where: { id: idusuario } });
      if (!usuario) {
        throw new NotFoundException('Usuário não encontrado');
      }

      // Verificar se o plano existe
      const plano = await manager.findOne(Plano, { where: { id: planoId } });
      if (!plano) {
        throw new NotFoundException('Plano não encontrado');
      }

      // Verificar se o usuário já tem algum plano ativo
      const planoExistente = await manager.findOne(AlunoPlano, {
        where: {
          idusuario: idusuario,
          ativo: true,
        },
      });

      if (planoExistente) {
        // Cancelar plano existente
        await manager.update(
          AlunoPlano,
          { idusuario: planoExistente.idusuario, planoId: planoExistente.planoId },
          {
            status: 'cancelado',
            ativo: false,
            observacoes: (planoExistente.observacoes || '') + 
                        '\nPlano substituído por um novo em ' + new Date().toISOString().split('T')[0],
          }
        );
      }

      // Verificar associação existente
      const associacaoExistente = await manager.findOne(AlunoPlano, {
        where: {
          idusuario: idusuario,
          planoId: planoId,
        },
      });

      if (associacaoExistente) {
        throw new BadRequestException('Este usuário já está associado a este plano.');
      }

      // Calcular data prevista de término
      let dataFinal = dataPrevisaoTermino ? new Date(dataPrevisaoTermino) : null;
      if (!dataFinal && plano.duracao) {
        const dataBase = dataInicio ? new Date(dataInicio) : new Date();
        dataFinal = new Date(dataBase);
        dataFinal.setMonth(dataFinal.getMonth() + plano.duracao);
      }

      // Criar a associação
      const alunoPlano = manager.create(AlunoPlano, {
        idusuario: idusuario,
        planoId: planoId,
        dataInicio: dataInicio ? new Date(dataInicio) : new Date(),
        dataPrevisaoTermino: dataFinal,
        status: status || 'não iniciado',
        observacoes,
        ativo: true,
      });

      return await manager.save(AlunoPlano, alunoPlano);
    });
  }

  /**
   * ATENÇÃO: Método testado e funcional - Não alterar sem consulta!
   * 
   * Atualiza o progresso de um aluno em um plano
   * 
   * Fluxo de execução:
   * 1. Busca a associação aluno-plano pela chave composta (idusuario, planoId)
   * 2. Atualiza campos conforme solicitado:
   *    - progresso: percentual de conclusão (0-100)
   *    - status: estado atual do plano
   *    - dataConclusao: preenchida automaticamente ao concluir
   *    - observacoes: notas sobre o progresso
   * 3. Se status muda para 'concluído', define data de conclusão
   * 
   * IMPORTANTE: Este método não altera o campo 'ativo'
   * A ativação/inativação deve ser feita via atribuição de planos
   */
  async atualizarProgresso(atualizarProgressoDto: AtualizarProgressoDto): Promise<AlunoPlano> {
    const { idusuario, planoId, progresso, status, dataConclusao, observacoes } = atualizarProgressoDto;

    // Buscar pela chave composta
    const alunoPlano = await this.alunoPlanoRepository.findOne({
      where: { idusuario: idusuario, planoId },
    });

    if (!alunoPlano) {
      throw new NotFoundException('Associação aluno-plano não encontrada');
    }

    // Atualizar os campos
    const dadosAtualizacao: Partial<AlunoPlano> = {};

    if (progresso !== undefined) dadosAtualizacao.progresso = progresso;
    
    if (status) {
      dadosAtualizacao.status = status;
      if (status === 'concluído' && !dataConclusao && !alunoPlano.dataConclusao) {
        dadosAtualizacao.dataConclusao = new Date();
      }
    }

    if (dataConclusao) {
      dadosAtualizacao.dataConclusao = new Date(dataConclusao);
      if (alunoPlano.status !== 'concluído' && !status) {
        dadosAtualizacao.status = 'concluído';
      }
    }

    if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;

    // Atualizar o registro
    await this.alunoPlanoRepository.update(
      { idusuario: idusuario, planoId },
      dadosAtualizacao
    );

    // Retornar os dados atualizados
    return await this.buscarAssociacaoPorChave(idusuario, planoId);
  }

  /**
   * ATENÇÃO: Método testado e funcional - Não alterar sem consulta!
   * 
   * Remove a associação entre um aluno e um plano
   * 
   * IMPORTANTE: 
   * - Este método realiza exclusão física do registro
   * - Para inativar um plano, use atribuirPlanoAluno com um novo plano
   * - Só use este método em casos específicos de correção de dados
   */
  async removerAssociacao(removerAssociacaoDto: RemoverAssociacaoDto): Promise<void> {
    const { idusuario, planoId } = removerAssociacaoDto;

    // Buscar pela chave composta
    const alunoPlano = await this.alunoPlanoRepository.findOne({
      where: { idusuario: idusuario, planoId },
    });

    if (!alunoPlano) {
      throw new NotFoundException('Associação aluno-plano não encontrada');
    }

    await this.alunoPlanoRepository.remove(alunoPlano);
  }

  /**
   * Lista todas as associações entre alunos e planos
   */
  async listarAssociacoes(): Promise<AlunoPlano[]> {
    return await this.alunoPlanoRepository.find({
      relations: ['usuario', 'plano'],
      select: {
        usuario: {
          id: true,
          login: true,
        },
        plano: {
          id: true,
          nome: true,
          cargo: true,
          duracao: true,
        },
      },
    });
  }

  /**
   * Busca uma associação aluno-plano específica pela chave composta
   */
  async buscarAssociacaoPorChave(idusuario: number, planoId: number): Promise<AlunoPlano> {
    const associacao = await this.alunoPlanoRepository.findOne({
      where: { idusuario, planoId },
      relations: ['usuario', 'plano'],
      select: {
        usuario: {
          id: true,
          login: true,
        },
        plano: {
          id: true,
          nome: true,
          cargo: true,
          duracao: true,
        },
      },
    });

    if (!associacao) {
      throw new NotFoundException('Associação não encontrada');
    }

    return associacao;
  }

  /**
   * Busca os planos associados a um aluno
   */
  async buscarPlanosPorAluno(alunoId: number): Promise<AlunoPlano[]> {
    return await this.alunoPlanoRepository.find({
      where: { idusuario: alunoId },
      relations: ['plano'],
    });
  }

  /**
   * Busca os alunos associados a um plano
   */
  async buscarAlunosPorPlano(planoId: number): Promise<AlunoPlano[]> {
    return await this.alunoPlanoRepository.find({
      where: { planoId: planoId },
      relations: ['usuario'],
      select: {
        usuario: {
          id: true,
          login: true,
        },
      },
    });
  }

  /**
   * Retorna o plano associado ao aluno logado
   * ATENÇÃO: Retorna apenas planos ativos (ativo = true)
   */
  async buscarPlanoDoAlunoLogado(idUsuario: number): Promise<AlunoPlano> {
    const associacao = await this.alunoPlanoRepository.findOne({
      where: { 
        idusuario: idUsuario,
        ativo: true,
      },
      relations: [
        'plano',
        'plano.sprints',
        'plano.sprints.metas',
      ],
    });

    if (!associacao) {
      throw new NotFoundException('Você não possui planos de estudo atribuídos.');
    }

    return associacao;
  }
}
