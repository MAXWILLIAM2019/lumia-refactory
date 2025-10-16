import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../entities/usuario.entity';
import { GrupoUsuario } from '../entities/grupoUsuario.entity';
import { AlunoInfo } from '../entities/alunoInfo.entity';
import { AdministradorInfo } from '../entities/administradorInfo.entity';
import { AlunoPlanos } from '../../planos/entities/alunoPlanos.entity';
import { Plano } from '../../planos/entities/plano.entity';
import { PlanoMestre } from '../../planos/entities/planoMestre.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { Meta } from '../../metas/entities/meta.entity';
import { ServicoPlano } from '../../planos/services/servicoPlano';
import { StatusCadastro } from '../../common/enums/statusCadastro.enum';
import { StatusPagamento } from '../../common/enums/statusPagamento.enum';
import { StatusPlano } from '../../common/enums/statusPlano.enum';
import { StatusMeta } from '../../common/enums/statusMeta.enum';
import { CriarUsuarioDto, CadastroCompletoDto } from '../dto/criarUsuario.dto';
import { AtualizarUsuarioDto } from '../dto/atualizarUsuario.dto';
import { AlterarSenhaDto } from '../dto/alterarSenha.dto';
import { NotificacoesAlunoDto } from '../dto/notificacoesAluno.dto';

/**
 * Serviço central para gerenciamento de usuários
 *
 * Este serviço contém todas as operações relacionadas a usuários,
 * incluindo operações específicas para alunos e administradores.
 *
 * Foi consolidado para evitar duplicação de código e centralizar
 * a lógica de negócio relacionada a usuários.
 */
@Injectable()
export class ServicoUsuario {

  /**
   * Limpa o CPF removendo pontos e hífen
   *
   * @param cpf - CPF com ou sem formatação
   * @returns CPF limpo contendo apenas números
   */
  private limparCpf(cpf: string): string {
    if (!cpf) return cpf;
    return cpf.replace(/[.\-]/g, '');
  }
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(GrupoUsuario)
    private grupoRepository: Repository<GrupoUsuario>,
    @InjectRepository(AlunoInfo)
    private alunoInfoRepository: Repository<AlunoInfo>,
    @InjectRepository(AdministradorInfo)
    private administradorInfoRepository: Repository<AdministradorInfo>,
    @InjectRepository(AlunoPlanos)
    private alunoPlanosRepository: Repository<AlunoPlanos>,
    @InjectRepository(Plano)
    private planoRepository: Repository<Plano>,
    @InjectRepository(PlanoMestre)
    private planoMestreRepository: Repository<PlanoMestre>,
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(Meta)
    private metaRepository: Repository<Meta>,
    private servicoPlano: ServicoPlano,
    private dataSource: DataSource,
  ) {}

  /**
   * Cria um novo usuário no sistema
   * 
   * @param {CriarUsuarioDto} dadosUsuario - Dados do usuário a ser criado
   * @returns {Promise<Usuario>} Usuário criado
   * @throws {ConflictException} Se o email ou CPF já existirem
   * @throws {BadRequestException} Se o grupo não for encontrado
   */
  async criarUsuario(dadosUsuario: CriarUsuarioDto): Promise<Usuario> {
    const { nome, email, cpf, senha, grupo, dataNascimento } = dadosUsuario;

    // Limpa o CPF removendo pontos e hífen
    const cpfLimpo = this.limparCpf(cpf);

    // Verifica se já existe usuário com o mesmo email
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { login: email },
    });

    if (usuarioExistente) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    // Verifica se já existe usuário com o mesmo CPF
    const cpfExistente = await this.usuarioRepository.findOne({
      where: { cpf: cpfLimpo },
    });

    if (cpfExistente) {
      throw new ConflictException('Já existe um usuário com este CPF');
    }

    // Busca o grupo
    const grupoObj = await this.grupoRepository.findOne({
      where: { nome: grupo },
    });

    if (!grupoObj) {
      throw new BadRequestException(`Grupo de usuário "${grupo}" não encontrado`);
    }

    // Criptografa a senha (sempre obrigatória)
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    
    // Usar transação para garantir que ambas as operações (criar usuário e info complementar) sejam concluídas com sucesso
    // ou nenhuma delas seja realizada em caso de erro
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    let novoUsuario;
    
    try {
      // Cria o usuário dentro da transação
      novoUsuario = await queryRunner.manager.save('usuario', {
        login: email,
        senha: senhaCriptografada,
        grupoId: grupoObj.id,
        situacao: true,
        nome,
        cpf: cpfLimpo, // Usa o CPF limpo (sem pontos e hífen)
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Cria info complementar baseado no grupo dentro da mesma transação
      if (grupo === 'aluno') {
        // Usa query SQL direta para garantir que a data seja inserida corretamente
        const dataNascValue = dataNascimento && dataNascimento.trim() !== '' ? `'${dataNascimento}'` : 'NULL';

        const insertQuery = `
          INSERT INTO aluno_info (
            idusuario, email, cpf, data_nascimento,
            status_cadastro, status_pagamento, data_criacao
          ) VALUES (
            ${novoUsuario.id}, '${email}', '${cpfLimpo}', ${dataNascValue},
            '${StatusCadastro.PRE_CADASTRO}', '${StatusPagamento.PENDENTE}', CURRENT_TIMESTAMP
          )
        `;

        await queryRunner.query(insertQuery);
        
        console.log(`✅ Aluno cadastrado com sucesso: ${nome} (${email}) - ID: ${novoUsuario.id}`);
      } else if (grupo === 'administrador') {
        await queryRunner.manager.insert('administrador_info', {
          idusuario: novoUsuario.id,
          nome,
          email,
          data_criacao: new Date(),
          ativo: true,
        });
        
        console.log(`✅ Administrador cadastrado com sucesso: ${nome} (${email}) - ID: ${novoUsuario.id}`);
      }
      
      // Confirma a transação se tudo ocorreu bem
      await queryRunner.commitTransaction();
      
    } catch (error) {
      // Reverte a transação em caso de erro
      await queryRunner.rollbackTransaction();
      console.error('Erro ao cadastrar usuário:', error);
      throw new InternalServerErrorException('Erro ao cadastrar usuário. Por favor, tente novamente.');
    } finally {
      // Libera o queryRunner
      await queryRunner.release();
    }

    return novoUsuario;
  }

  async buscarTodosUsuarios(): Promise<Usuario[]> {
    return await this.usuarioRepository.find({
      relations: ['grupo'],
      order: { id: 'ASC' },
    });
  }

  async buscarUsuariosPorGrupo(grupo: string): Promise<Usuario[]> {
    return await this.usuarioRepository.find({
      where: { grupo: { nome: grupo } },
      relations: ['grupo', 'alunoInfo', 'administradorInfo'],
      order: { id: 'ASC' },
    });
  }

  /**
   * Busca um usuário pelo ID
   * 
   * @param {number} id - ID do usuário
   * @param {boolean} [incluirInfoComplementar=false] - Se deve incluir informações complementares (AlunoInfo ou AdministradorInfo)
   * @returns {Promise<Usuario>} Usuário encontrado
   * @throws {NotFoundException} Se o usuário não for encontrado
   */
  async buscarUsuarioPorId(id: number, incluirInfoComplementar: boolean = false): Promise<Usuario> {
    const relations = ['grupo'];
    
    if (incluirInfoComplementar) {
      relations.push('alunoInfo', 'administradorInfo');
    }
    
    const usuario = await this.usuarioRepository.findOne({
      where: { id, situacao: true },
      relations,
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return usuario;
  }

  async atualizarUsuario(id: number, dadosAtualizacao: AtualizarUsuarioDto): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['grupo', 'alunoInfo', 'administradorInfo'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se o novo email já existe em outro usuário
    if (dadosAtualizacao.email && dadosAtualizacao.email !== usuario.login) {
      const emailExistente = await this.usuarioRepository.findOne({
        where: { login: dadosAtualizacao.email },
      });

      if (emailExistente) {
        throw new ConflictException('Já existe um usuário com este email');
      }
    }

    // Atualiza o usuário
    await this.usuarioRepository.update(id, {
      nome: dadosAtualizacao.nome || usuario.nome,
      login: dadosAtualizacao.email || usuario.login,
      updatedAt: new Date(),
    });

    // Atualiza dados específicos do grupo
    if (usuario.grupo.nome === 'aluno' && usuario.alunoInfo) {
      const dadosAlunoInfo: Partial<AlunoInfo> = {};
      
      if (dadosAtualizacao.email) dadosAlunoInfo.email = dadosAtualizacao.email;
      if (dadosAtualizacao.telefone !== undefined) dadosAlunoInfo.telefone = dadosAtualizacao.telefone;
      if (dadosAtualizacao.biografia !== undefined) dadosAlunoInfo.biografia = dadosAtualizacao.biografia;
      if (dadosAtualizacao.formacao !== undefined) dadosAlunoInfo.formacao = dadosAtualizacao.formacao;
      if (dadosAtualizacao.isTrabalhando !== undefined) dadosAlunoInfo.is_trabalhando = dadosAtualizacao.isTrabalhando;
      if (dadosAtualizacao.isAceitaTermos !== undefined) dadosAlunoInfo.is_aceita_termos = dadosAtualizacao.isAceitaTermos;

      if (Object.keys(dadosAlunoInfo).length > 0) {
        await this.alunoInfoRepository.update(usuario.alunoInfo.id, dadosAlunoInfo);
      }
    }

    // Retorna o usuário atualizado
    return await this.buscarUsuarioPorId(id);
  }

  async removerUsuario(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id, situacao: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Soft delete - marca como inativo
    await this.usuarioRepository.update(id, { situacao: false });
  }

  /**
   * Altera a senha de um usuário
   * 
   * @param {number} id - ID do usuário
   * @param {AlterarSenhaDto} dadosSenha - Dados da nova senha
   * @param {Usuario|{grupo: {nome: string}, id: number}} usuarioLogado - Usuário que está realizando a alteração
   * @returns {Promise<string>} Mensagem de sucesso
   * @throws {NotFoundException} Se o usuário não for encontrado
   * @throws {BadRequestException} Se a senha atual for obrigatória e não for fornecida ou estiver incorreta
   */
  async alterarSenha(
    id: number, 
    dadosSenha: AlterarSenhaDto, 
    usuarioLogado: Usuario | {grupo: {nome: string}, id: number}
  ): Promise<string> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['grupo'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se for o próprio usuário alterando a senha, valida a senha atual
    if (usuarioLogado.grupo.nome === 'aluno' && usuarioLogado.id === id) {
      if (!dadosSenha.senhaAtual) {
        throw new BadRequestException('A senha atual é obrigatória');
      }

      const senhaAtualValida = await bcrypt.compare(dadosSenha.senhaAtual, usuario.senha);
      if (!senhaAtualValida) {
        throw new BadRequestException('Senha atual incorreta');
      }
    }

    // Criptografa e salva a nova senha
    const senhaCriptografada = await bcrypt.hash(dadosSenha.novaSenha, 10);
    await this.usuarioRepository.update(id, { senha: senhaCriptografada });
    
    // Determina a mensagem baseada em quem está alterando a senha
    const isAdmin = usuarioLogado.grupo.nome === 'administrador';
    const isAlteringSelf = usuarioLogado.id === id;
    
    let message: string;
    if (isAdmin && !isAlteringSelf) {
      message = 'Senha definida com sucesso';
    } else {
      message = 'Senha alterada com sucesso';
    }
    
    console.log(`✅ Senha ${isAdmin && !isAlteringSelf ? 'definida' : 'alterada'} com sucesso para usuário ID ${id}`);
    
    return message;
  }

  /**
   * Gera uma senha aleatória para formulários de cadastro (sem persistir)
   *
   * @returns {Promise<string>} Senha aleatória de 8 caracteres
   */
  async gerarSenhaAleatoria(): Promise<string> {
    const senhaGerada = Math.random().toString(36).slice(-8);

    return senhaGerada;
  }

  /**
   * Cadastro completo de usuário com associação opcional de plano
   * Garante atomicidade quando plano é associado
   *
   * @param dadosCadastro - Dados completos do cadastro
   * @returns Usuário criado e informações do plano (se associado)
   */
  async cadastroCompleto(dadosCadastro: CadastroCompletoDto): Promise<any> {
    const { nome, email, cpf, senha, grupo, dataNascimento, planoMestreId, associarPlano } = dadosCadastro;

    // Limpa o CPF removendo pontos e hífen
    const cpfLimpo = this.limparCpf(cpf);

    // Validações iniciais (fora da transação)
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { login: email },
    });
    if (usuarioExistente) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    const cpfExistente = await this.usuarioRepository.findOne({
      where: { cpf: cpfLimpo },
    });
    if (cpfExistente) {
      throw new ConflictException('Já existe um usuário com este CPF');
    }

    // Busca o grupo
    const grupoObj = await this.grupoRepository.findOne({
      where: { nome: grupo },
    });
    if (!grupoObj) {
      throw new BadRequestException(`Grupo de usuário "${grupo}" não encontrado`);
    }

    // Se vai associar plano, valida se plano mestre existe
    if (associarPlano && planoMestreId) {
      const planoMestreExistente = await this.planoMestreRepository.findOne({
        where: { id: planoMestreId, ativo: true },
        relations: ['sprintsMestre']
      });
      if (!planoMestreExistente) {
        throw new NotFoundException(`Plano mestre com ID ${planoMestreId} não encontrado ou inativo`);
      }
      if (!planoMestreExistente.sprintsMestre || planoMestreExistente.sprintsMestre.length === 0) {
        throw new BadRequestException(`Plano mestre ${planoMestreId} não possui sprints configuradas`);
      }
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Inicia transação atômica
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let novoUsuario;
    let planoAssociado = null;

    try {
      // 1. Criar usuário
      novoUsuario = await queryRunner.manager.save('usuario', {
        login: email,
        senha: senhaCriptografada,
        grupoId: grupoObj.id,
        situacao: true,
        nome,
        cpf: cpfLimpo,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 2. Criar aluno_info (se for aluno)
      if (grupo === 'aluno') {
        await queryRunner.manager.insert('aluno_info', {
          idusuario: novoUsuario.id,
          email,
          cpf: cpfLimpo,
          data_nascimento: dataNascimento ? dataNascimento : null,
          status_cadastro: StatusCadastro.PRE_CADASTRO,
          status_pagamento: StatusPagamento.PENDENTE,
          data_criacao: new Date(),
        });
      } else if (grupo === 'administrador') {
        await queryRunner.manager.insert('administrador_info', {
          idusuario: novoUsuario.id,
          nome,
          email,
          data_criacao: new Date(),
          ativo: true,
        });
      }

      // 3. Se solicitado, criar instância do plano mestre e associar
      if (associarPlano && planoMestreId && grupo === 'aluno') {
        // Buscar plano mestre com estrutura completa
        const planoMestre: any = await queryRunner.manager.findOne('PlanoMestre', {
          where: { id: planoMestreId, ativo: true },
          relations: ['sprintsMestre', 'sprintsMestre.metasMestre']
        });

        if (!planoMestre) {
          throw new NotFoundException(`Plano mestre ${planoMestreId} não encontrado`);
        }

        // Verifica se aluno já tem plano ativo deste mestre
        const planoExistenteDoMestre: any = await queryRunner.manager.findOne('AlunoPlanos', {
          where: {
            usuarioId: novoUsuario.id,  // Propriedade da entidade
            ativo: true
          },
          relations: ['plano']
        });

        if (planoExistenteDoMestre?.plano?.planoMestreId === planoMestreId) {
          throw new ConflictException(`Aluno já possui plano ativo baseado neste plano mestre.`);
        }

        // Criar instância personalizada do plano
        const novoPlano: any = await queryRunner.manager.save('Plano', {
          nome: planoMestre.nome,
          cargo: planoMestre.cargo,
          descricao: planoMestre.descricao || `Instância personalizada de: ${planoMestre.nome}`,
          duracao: planoMestre.duracao,
          planoMestreId: planoMestre.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Criar sprints baseadas nos templates
        const sprintsCriadas = [];
        let dataInicioAtual = new Date();

        for (const sprintMestre of planoMestre.sprintsMestre.sort((a, b) => a.posicao - b.posicao)) {
          const duracaoDias = sprintMestre.dataInicio && sprintMestre.dataFim
            ? Math.ceil((new Date(sprintMestre.dataFim).getTime() - new Date(sprintMestre.dataInicio).getTime()) / (1000 * 60 * 60 * 24))
            : 7;

          const dataFimAtual = new Date(dataInicioAtual);
          dataFimAtual.setDate(dataFimAtual.getDate() + duracaoDias);

          const novaSprint: any = await queryRunner.manager.save('Sprint', {
            nome: sprintMestre.nome,
            dataInicio: dataInicioAtual,
            dataFim: dataFimAtual,
            posicao: sprintMestre.posicao,
            status: StatusMeta.PENDENTE,
            planoId: novoPlano.id,
            sprintMestreId: sprintMestre.id,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          // Criar metas baseadas nos templates
          if (sprintMestre.metasMestre) {
            for (const metaMestre of sprintMestre.metasMestre.sort((a, b) => a.posicao - b.posicao)) {
              await queryRunner.manager.save('Meta', {
                disciplinaId: metaMestre.disciplinaId,
                disciplina: metaMestre.disciplina,
                tipo: metaMestre.tipo,
                assuntoId: metaMestre.assuntoId,
                assunto: metaMestre.assunto,
                comandos: metaMestre.comandos,
                link: metaMestre.link,
                relevancia: metaMestre.relevancia,
                tempoEstudado: metaMestre.tempoEstudado || '00:00',
                status: StatusMeta.PENDENTE,
                totalQuestoes: metaMestre.totalQuestoes || 0,
                questoesCorretas: 0,
                posicao: metaMestre.posicao,
                sprintId: novaSprint.id,
                metaMestreId: metaMestre.id,
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
          }

          sprintsCriadas.push(novaSprint);
          dataInicioAtual = new Date(dataFimAtual);
          dataInicioAtual.setDate(dataInicioAtual.getDate() + 1); // Próxima sprint começa no dia seguinte
        }

        // Desabilitar plano anterior ativo (se existir)
        await queryRunner.manager.update('AlunoPlanos',
          { usuarioId: novoUsuario.id, ativo: true },  // Propriedade da entidade
          { ativo: false, dataConclusao: new Date(), updatedAt: new Date() }  // Propriedade da entidade
        );

        // Associar nova instância ao aluno
        const novaAssociacao = await queryRunner.manager.insert('AlunoPlanos', {
          usuarioId: novoUsuario.id,  // Propriedade da entidade
          planoId: novoPlano.id,      // Propriedade da entidade
          dataInicio: new Date(),     // Propriedade da entidade
          progresso: 0,
          status: StatusPlano.NAO_INICIADO,
          ativo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        planoAssociado = {
          id: novaAssociacao.identifiers[0],
          planoId: novoPlano.id,
          planoMestreId: planoMestreId,
          nome: novoPlano.nome,
          totalSprints: sprintsCriadas.length,
          status: StatusPlano.NAO_INICIADO,
          ativo: true,
          dataInicio: new Date(),
        };

        console.log(`✅ Instância do plano mestre ${planoMestreId} criada e associada ao aluno ${nome} (ID: ${novoUsuario.id})`);
      }

      // Confirma transação
      await queryRunner.commitTransaction();

      const result: any = {
        message: associarPlano && planoMestreId ? 'Usuário criado e plano associado com sucesso' : 'Usuário criado com sucesso',
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.login,
          cpf: novoUsuario.cpf,
          situacao: novoUsuario.situacao,
        }
      };

      if (planoAssociado) {
        result.plano = planoAssociado;
      }

      console.log(`✅ Cadastro completo realizado: ${nome} (${email}) - ID: ${novoUsuario.id}`);
      return result;

    } catch (error) {
      // Rollback em caso de erro
      await queryRunner.rollbackTransaction();
      console.error('Erro no cadastro completo:', error);

      if (error instanceof ConflictException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao realizar cadastro. Por favor, tente novamente.');
    } finally {
      await queryRunner.release();
    }
  }


  /**
   * Atualiza as configurações de notificação de um aluno
   * 
   * @param {number} id - ID do usuário/aluno
   * @param {NotificacoesAlunoDto} notificacoes - Novas configurações de notificação
   * @returns {Promise<{message: string, notificacoes: any}>} Mensagem de sucesso e configurações atualizadas
   * @throws {NotFoundException} Se o usuário não for encontrado
   * @throws {BadRequestException} Se o usuário não for um aluno
   */
  async atualizarNotificacoes(id: number, notificacoes: NotificacoesAlunoDto): Promise<{message: string, notificacoes: any}> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['grupo', 'alunoInfo'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (usuario.grupo.nome !== 'aluno') {
      throw new BadRequestException('Apenas alunos podem configurar notificações');
    }

    let alunoInfo = usuario.alunoInfo;

    // Valores padrão para as notificações
    const notif_novidades_plataforma = notificacoes.novidadesPlataforma ?? true;
    const notif_mensagens_mentor = notificacoes.mensagensMentor ?? true;
    const notif_novo_material = notificacoes.novoMaterial ?? true;
    const notif_atividades_simulados = notificacoes.atividadesSimulados ?? false;
    const notif_mentorias = notificacoes.mentorias ?? false;

    if (!alunoInfo) {
      // Cria um novo registro se não existir
      const resultado = await this.alunoInfoRepository.insert({
        idusuario: id,
        email: usuario.login,
        notif_novidades_plataforma,
        notif_mensagens_mentor,
        notif_novo_material,
        notif_atividades_simulados,
        notif_mentorias,
        dataCriacao: new Date(),
      });
      alunoInfo = await this.alunoInfoRepository.findOne({ where: { id: resultado.identifiers[0].id } });
    } else {
      // Atualiza o registro existente
      await this.alunoInfoRepository.update(alunoInfo.id, {
        notif_novidades_plataforma,
        notif_mensagens_mentor,
        notif_novo_material,
        notif_atividades_simulados,
        notif_mentorias,
      });

      // Busca o registro atualizado
      alunoInfo = await this.alunoInfoRepository.findOne({
        where: { id: alunoInfo.id },
      });
    }

    console.log(`✅ Configurações de notificação atualizadas para aluno ID ${id}`);
    
    return {
      message: 'Configurações de notificação atualizadas com sucesso',
      notificacoes: {
        novidadesPlataforma: alunoInfo.notif_novidades_plataforma,
        mensagensMentor: alunoInfo.notif_mensagens_mentor,
        novoMaterial: alunoInfo.notif_novo_material,
        atividadesSimulados: alunoInfo.notif_atividades_simulados,
        mentorias: alunoInfo.notif_mentorias,
      },
    };
  }
  
  // Método de listar grupos removido por não ser utilizado

  /**
   * Busca as informações complementares de um aluno
   * 
   * @param {number} id - ID do usuário/aluno
   * @returns {Promise<AlunoInfo>} Informações complementares do aluno
   * @throws {NotFoundException} Se o usuário não for encontrado ou não for um aluno
   */
  async buscarInfoAluno(id: number): Promise<AlunoInfo> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['grupo', 'alunoInfo'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (usuario.grupo?.nome !== 'aluno') {
      throw new BadRequestException('Usuário não é um aluno');
    }

    if (!usuario.alunoInfo) {
      throw new NotFoundException('Informações do aluno não encontradas');
    }

    return usuario.alunoInfo;
  }
  
  /**
   * Busca um aluno pelo ID e formata a resposta
   * 
   * @param {number} id - ID do aluno
   * @returns {Promise<any>} Dados formatados do aluno
   * @throws {NotFoundException} Se o aluno não for encontrado
   */
  async buscarAlunoPorId(id: number): Promise<any> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id, situacao: true },
      relations: ['grupo', 'alunoInfo'],
    });

    if (!usuario || usuario.grupo?.nome !== 'aluno') {
      throw new NotFoundException('Aluno não encontrado');
    }

    return {
      id: usuario.id,
      email: usuario.login,
      situacao: usuario.situacao,
      nome: usuario.nome || '',
      cpf: usuario.cpf || '',
      info: usuario.alunoInfo || {},
    };
  }
  
  /**
   * Busca todos os alunos cadastrados
   * 
   * @returns {Promise<any[]>} Lista de alunos formatada
   */
  async buscarTodosAlunos(): Promise<any[]> {
    const alunos = await this.usuarioRepository.find({
      where: { situacao: true },
      relations: ['grupo', 'alunoInfo'],
    });

    // Filtra apenas usuários do grupo "aluno"
    const alunosFiltrados = alunos.filter(aluno => aluno.grupo?.nome === 'aluno');

    return alunosFiltrados.map(aluno => ({
      id: aluno.id,
      email: aluno.login,
      situacao: aluno.situacao,
      nome: aluno.nome || '',
      cpf: aluno.cpf || '',
      info: aluno.alunoInfo || {},
    }));
  }
}
