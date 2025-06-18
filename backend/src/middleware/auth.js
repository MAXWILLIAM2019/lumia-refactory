/**
 * Middleware de Autenticação
 * 
 * Verifica se o usuário está autenticado através do token JWT.
 * Este middleware é aplicado às rotas protegidas.
 * Suporta autenticação de administradores e alunos.
 * 
 * Projetado para ser compatível com futura integração SSO (Keycloak).
 */
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const GrupoUsuario = require('../models/GrupoUsuario');
const AlunoInfo = require('../models/AlunoInfo');
const AdministradorInfo = require('../models/AdministradorInfo');

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Middleware de autenticação iniciado');
    console.log('🔄 Método da requisição:', req.method);
    console.log('🌐 URL da requisição:', req.originalUrl);

    // Verifica se o token foi fornecido
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token não fornecido' 
      });
    }

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Informações básicas do usuário
    const userInfo = {
      id: decoded.IdUsuario || decoded.id, // Compatibilidade com ambos os formatos
      role: decoded.role
    };

    // Se houver impersonation, adiciona as informações originais
    if (decoded['sis-mentoria']?.impersonating) {
      userInfo.isImpersonating = true;
      userInfo.originalId = decoded['sis-mentoria'].impersonating.originalId;
      userInfo.originalRole = decoded['sis-mentoria'].impersonating.originalRole;
    }

    // Adiciona as informações do usuário à requisição
    req.user = userInfo;

    // Log das informações do usuário (útil para debug)
    console.log('👤 Informações do usuário:', {
      ...userInfo,
      url: req.originalUrl,
      method: req.method
    });

    next();
  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido ou expirado' 
    });
  }
};

/**
 * Middleware para verificar se o usuário é administrador
 */
const adminOnly = async (req, res, next) => {
  try {
    // Se estiver impersonating, usa o papel original
    const role = req.user.isImpersonating ? req.user.originalRole : req.user.role;
    
    if (role !== 'administrador') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso permitido apenas para administradores' 
      });
    }
    next();
  } catch (error) {
    console.error('Erro ao verificar permissão de administrador:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar permissões' 
    });
  }
};

/**
 * Middleware para verificar se o usuário é o dono do recurso ou um administrador
 * @param {string} paramId - Nome do parâmetro que contém o ID do recurso
 */
const ownProfileOrAdmin = (paramId) => async (req, res, next) => {
  try {
    const resourceId = req.params[paramId];
    const userId = req.user.id;
    const role = req.user.isImpersonating ? req.user.originalRole : req.user.role;

    if (role === 'administrador' || userId === parseInt(resourceId)) {
      return next();
    }

    res.status(403).json({ 
      success: false, 
      message: 'Acesso não autorizado a este recurso' 
    });
  } catch (error) {
    console.error('Erro ao verificar permissão de acesso:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar permissões' 
    });
  }
};

module.exports = {
  auth,
  adminOnly,
  ownProfileOrAdmin
}; 