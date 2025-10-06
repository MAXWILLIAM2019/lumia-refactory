import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../entities/usuario.entity';
import { GrupoUsuario } from '../entities/grupoUsuario.entity';
import { AlunoInfo } from '../entities/alunoInfo.entity';
import { AdministradorInfo } from '../entities/administradorInfo.entity';
import { StatusCadastro } from '../../common/enums/statusCadastro.enum';
import { StatusPagamento } from '../../common/enums/statusPagamento.enum';
import { CriarUsuarioDto } from '../dto/criarUsuario.dto';
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
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(GrupoUsuario)
    private grupoRepository: Repository<GrupoUsuario>,
    @InjectRepository(AlunoInfo)
    private alunoInfoRepository: Repository<AlunoInfo>,
    @InjectRepository(AdministradorInfo)
    private administradorInfoRepository: Repository<AdministradorInfo>,
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
    const { nome, email, cpf, senha, grupo } = dadosUsuario;

    // Verifica se já existe usuário com o mesmo email
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { login: email },
    });

    if (usuarioExistente) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    // Verifica se já existe usuário com o mesmo CPF
    const cpfExistente = await this.usuarioRepository.findOne({
      where: { cpf },
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

    // Criptografa a senha se fornecida, ou gera uma senha padrão para alunos
    let senhaCriptografada;
    if (senha) {
      senhaCriptografada = await bcrypt.hash(senha, 10);
    } else if (grupo === 'aluno' && cpf) {
      // Gera uma senha padrão baseada no CPF (últimos 6 dígitos) para alunos
      const senhaPadrao = cpf.slice(-6);
      senhaCriptografada = await bcrypt.hash(senhaPadrao, 10);
      console.log(`Senha padrão gerada para o aluno ${nome} (${email}) usando os últimos 6 dígitos do CPF`);
    } else {
      // Para outros grupos, a senha é obrigatória
      throw new BadRequestException('Senha é obrigatória para este tipo de usuário');
    }
    
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
        cpf,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Cria info complementar baseado no grupo dentro da mesma transação
      if (grupo === 'aluno') {
        await queryRunner.manager.insert('aluno_info', {
          idusuario: novoUsuario.id,
          email,
          statusCadastro: StatusCadastro.PRE_CADASTRO,
          statusPagamento: StatusPagamento.PENDENTE,
          data_criacao: new Date(), // Corrigido de dataCriacao para data_criacao
        });
        
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
   * Gera uma senha aleatória para um usuário
   * 
   * @param {number} id - ID do usuário
   * @returns {Promise<{senha: string, message: string}>} Senha gerada e mensagem de sucesso
   * @throws {NotFoundException} Se o usuário não for encontrado
   */
  async gerarSenha(id: number): Promise<{senha: string, message: string}> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['grupo'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const senhaGerada = Math.random().toString(36).slice(-8);
    const senhaCriptografada = await bcrypt.hash(senhaGerada, 10);
    
    await this.usuarioRepository.update(id, { senha: senhaCriptografada });
    
    const tipoUsuario = usuario.grupo?.nome === 'aluno' ? 'aluno' : 'usuário';
    console.log(`✅ Senha gerada com sucesso para ${tipoUsuario} ID ${id}: ${senhaGerada}`);
    
    return {
      senha: senhaGerada,
      message: `Senha gerada com sucesso para ${tipoUsuario}`
    };
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
