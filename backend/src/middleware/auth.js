const jwt = require('jsonwebtoken');
const Administrador = require('../models/Administrador');

const auth = async (req, res, next) => {
  try {
    // Obtém o token do header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o administrador
    const admin = await Administrador.findByPk(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Adiciona o administrador ao request
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

module.exports = auth; 