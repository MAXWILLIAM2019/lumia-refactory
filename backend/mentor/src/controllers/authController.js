const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * @desc Login do administrador
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verifica se o administrador existe
    const admin = await prisma.administrador.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, admin.senha);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
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
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar login'
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
    const adminExistente = await prisma.administrador.findUnique({
      where: { email }
    });

    if (adminExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Cria o administrador
    const admin = await prisma.administrador.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        cargo
      }
    });

    // Gera o token JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

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
 * @desc Obtém dados do administrador logado
 * @route GET /api/auth/me
 * @access Private
 */
const me = async (req, res) => {
  try {
    const admin = await prisma.administrador.findUnique({
      where: { id: req.admin.id }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrador não encontrado'
      });
    }

    res.json({
      success: true,
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        cargo: admin.cargo
      }
    });
  } catch (error) {
    console.error('Erro ao obter dados do administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter dados do administrador'
    });
  }
};

module.exports = {
  login,
  registrar,
  me
}; 