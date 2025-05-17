/**
 * Middleware de Autenticação
 * 
 * Verifica se o usuário está autenticado através do token JWT.
 * Este middleware é aplicado às rotas protegidas.
 */
const jwt = require('jsonwebtoken');
const Administrador = require('../models/Administrador');

const auth = async (req, res, next) => {
  console.log('🔐 Middleware de autenticação iniciado');
  console.log('🔄 Método da requisição:', req.method);
  console.log('🌐 URL da requisição:', req.originalUrl);
  
  try {
    // Obtém o token do header
    const authHeader = req.header('Authorization');
    console.log('📝 Header de Autorização recebido:', authHeader);
    
    // Verifica se o token foi enviado
    if (!authHeader) {
      console.log('❌ Nenhum header de autorização fornecido');
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }
    
    // Extrai o token removendo o prefixo "Bearer "
    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token extraído:', token ? 'Presente' : 'Ausente');
    
    if (!token) {
      console.log('❌ Token vazio após processamento');
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // Verifica se a variável de ambiente JWT_SECRET está definida
    if (!process.env.JWT_SECRET) {
      console.error('❌ ERRO CRÍTICO: JWT_SECRET não definido no ambiente');
      return res.status(500).json({
        success: false,
        message: 'Erro de configuração do servidor'
      });
    }

    try {
      // Verifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verificado com sucesso:', decoded);
      
      // Busca o administrador
      const admin = await Administrador.findByPk(decoded.id);
      
      if (!admin) {
        console.log('❌ Administrador não encontrado para o ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Token inválido - usuário não encontrado'
        });
      }
      
      console.log('👤 Administrador autenticado:', admin.nome);
      
      // Adiciona o administrador ao request
      req.admin = admin;
      console.log('✅ Autenticação concluída com sucesso');
      next();
    } catch (jwtError) {
      console.error('❌ Erro na verificação do JWT:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
        details: jwtError.message
      });
    }
  } catch (error) {
    console.error('❌ Erro geral na autenticação:', error);
    res.status(401).json({
      success: false,
      message: 'Falha na autenticação',
      details: error.message
    });
  }
};

module.exports = auth; 