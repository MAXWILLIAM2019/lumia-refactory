const authService = require('../services/authService');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const GrupoUsuario = require('../models/GrupoUsuario');
const AlunoInfo = require('../models/AlunoInfo');
const AdministradorInfo = require('../models/AdministradorInfo');

/**
 * @desc Registro de novo usuário (unificado)
 * @route POST /auth/register
 * @access Public
 */
const registrar = async (req, res) => {
  try {
    const { nome, login, senha, grupo } = req.body;
    if (!nome || !login || !senha || !grupo) {
      return res.status(400).json({ success: false, message: 'Preencha todos os campos obrigatórios.' });
    }
    // Verifica se já existe usuário com o mesmo login
    const usuarioExistente = await Usuario.findOne({ where: { login } });
    if (usuarioExistente) {
      return res.status(400).json({ success: false, message: 'Login já está em uso.' });
    }
    // Busca o grupo na tabela grupo_usuario
    const grupoObj = await GrupoUsuario.findOne({ where: { nome: grupo } });
    if (!grupoObj) {
      return res.status(400).json({ success: false, message: 'Grupo de usuário inválido.' });
    }
    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    // Cria o usuário
    const novoUsuario = await Usuario.create({
      login,
      senha: senhaCriptografada,
      grupo: grupoObj.IdGrupo,
      situacao: true
    });
    // Cria info complementar
    if (grupo === 'aluno') {
      await AlunoInfo.create({
        IdUsuario: novoUsuario.IdUsuario,
        email: login
      });
    } else if (grupo === 'administrador') {
      await AdministradorInfo.create({
        IdUsuario: novoUsuario.IdUsuario,
        email: login
      });
    }
    return res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao registrar usuário.' });
  }
};

/**
 * @desc Login unificado (novo fluxo)
 * @route POST /auth/login
 * @access Public
 */
const loginUnificado = async (req, res) => {
  try {
    const { login, senha, grupo } = req.body;
    console.log('Tentativa de login:', { login, grupo });
    
    // Busca o usuário pelo login
    const usuario = await Usuario.findOne({
      where: { login, situacao: true },
      include: [
        { model: GrupoUsuario, as: 'grupoUsuario' },
        { model: AlunoInfo, as: 'alunoInfo' },
        { model: AdministradorInfo, as: 'adminInfo' }
      ]
    });

    console.log('Usuário encontrado:', usuario ? {
      id: usuario.IdUsuario,
      login: usuario.login,
      grupo: usuario.grupoUsuario?.nome
    } : 'Não encontrado');

    if (!usuario) {
      throw new Error('Usuário ou senha inválidos');
    }

    // Verifica se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    console.log('Senha válida:', senhaValida);
    
    if (!senhaValida) {
      throw new Error('Usuário ou senha inválidos');
    }

    // Verifica se o grupo informado corresponde ao grupo do usuário
    const grupoUsuario = usuario.grupoUsuario?.nome;
    console.log('Grupo do usuário:', grupoUsuario, 'Grupo informado:', grupo);
    
    if (grupoUsuario !== grupo) {
      throw new Error('Tipo de usuário incorreto');
    }

    // Gera o token JWT usando o authService
    const token = authService.gerarToken({
      id: usuario.IdUsuario,
      login: usuario.login,
      grupo: grupoUsuario,
      email: usuario.alunoInfo?.email || usuario.adminInfo?.email || null
    }, grupoUsuario);

    // Monta o objeto de resposta (sem senha)
    const usuarioSemSenha = usuario.toJSON();
    delete usuarioSemSenha.senha;

    console.log('Login bem-sucedido para:', grupoUsuario);
    
    res.json({
      success: true,
      token,
      usuario: usuarioSemSenha,
      grupo: grupoUsuario
    });
  } catch (error) {
    console.error('Erro no login unificado:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Usuário ou senha inválidos'
    });
  }
};

/**
 * @desc Obtém dados do usuário logado
 * @route GET /api/auth/me
 * @access Private
 */
const me = async (req, res) => {
  try {
    console.log('Buscando dados do usuário logado. Token decoded:', req.user);
    
    // O middleware de autenticação já validou o token e definiu req.user
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Busca o usuário completo com as informações específicas do seu tipo
    const usuario = await Usuario.findOne({
      where: { IdUsuario: userId, situacao: true },
      include: [
        { model: GrupoUsuario, as: 'grupoUsuario' },
        { model: AlunoInfo, as: 'alunoInfo' },
        { model: AdministradorInfo, as: 'adminInfo' }
      ]
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Remove a senha do objeto de resposta
    const usuarioSemSenha = usuario.toJSON();
    delete usuarioSemSenha.senha;

    // Monta a resposta baseada no tipo de usuário
    let responseData = {
      success: true,
      usuario: usuarioSemSenha,
      grupo: userRole
    };

    // Adiciona dados específicos do tipo de usuário para compatibilidade
    if (userRole === 'aluno' && usuario.alunoInfo) {
      responseData.aluno = {
        id: usuario.IdUsuario,
        nome: usuario.nome,
        email: usuario.alunoInfo.email,
        cpf: usuario.alunoInfo.cpf,
        login: usuario.login
      };
    } else if (userRole === 'administrador' && usuario.adminInfo) {
      responseData.administrador = {
        id: usuario.IdUsuario,
        nome: usuario.nome,
        email: usuario.adminInfo.email,
        cpf: usuario.adminInfo.cpf,
        login: usuario.login
      };
    }

    console.log('Dados do usuário retornados com sucesso para:', userRole);
    res.json(responseData);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário logado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  registrar,
  loginUnificado,
  me
}; 