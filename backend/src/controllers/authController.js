const authService = require('../services/authService');
const Administrador = require('../models/Administrador');
const Aluno = require('../models/Aluno');

/**
 * @desc Login do administrador
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    console.log('Iniciando login de administrador');
    const resultado = await authService.realizarLogin(req.body, 'admin');
    
    res.json({
      success: true,
      token: resultado.token,
      admin: resultado.usuario
    });
  } catch (error) {
    console.error('Erro no login de administrador:', error);
    res.status(401).json({
      success: false,
      message: 'Email ou senha inválidos'
    });
  }
};

/**
 * @desc Login do aluno
 * @route POST /api/auth/aluno/login
 * @access Public
 */
const loginAluno = async (req, res) => {
  try {
    console.log('Iniciando login de aluno');
    const resultado = await authService.realizarLogin(req.body, 'aluno');
    
    res.json({
      success: true,
      token: resultado.token,
      aluno: resultado.usuario
    });
  } catch (error) {
    console.error('Erro no login de aluno:', error);
    
    // Mensagem específica para alunos sem senha definida
    if (error.message === 'Credenciais inválidas' && req.body.email) {
      const aluno = await Aluno.findOne({ where: { email: req.body.email } });
      if (aluno && !aluno.senha) {
        return res.status(401).json({
          success: false,
          message: 'Senha não definida para este aluno'
        });
      }
    }
    
    res.status(401).json({
      success: false,
      message: 'Email ou senha inválidos'
    });
  }
};

/**
 * @desc Registro de novo administrador
 * @route POST /api/auth/register
 * @access Public
 */
const registrar = async (req, res) => {
  try {
    const { nome, email, senha, cargo } = req.body;

    // Verifica se o email já está em uso
    const adminExistente = await Administrador.findOne({
      where: { email }
    });

    if (adminExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Criptografa a senha
    const bcrypt = require('bcryptjs');
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Cria o administrador
    const admin = await Administrador.create({
      nome,
      email,
      senha: senhaCriptografada,
      cargo
    });

    // Gera o token JWT
    const token = authService.gerarToken(admin, 'admin');

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        cargo: admin.cargo
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar administrador'
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
    // Verifica o perfil (role) através do token decodificado
    if (req.user.role === 'admin') {
      const admin = await Administrador.findByPk(req.user.id);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Administrador não encontrado'
        });
      }

      return res.json({
        success: true,
        role: 'admin',
        admin: {
          id: admin.id,
          nome: admin.nome,
          email: admin.email,
          cargo: admin.cargo
        }
      });
    } else if (req.user.role === 'aluno') {
      const aluno = await Aluno.findByPk(req.user.id, {
        attributes: { exclude: ['senha'] }
      });

      if (!aluno) {
        return res.status(404).json({
          success: false,
          message: 'Aluno não encontrado'
        });
      }

      return res.json({
        success: true,
        role: 'aluno',
        aluno
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Perfil de usuário não reconhecido'
    });
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter dados do usuário'
    });
  }
};

module.exports = {
  login,
  loginAluno,
  registrar,
  me
}; 