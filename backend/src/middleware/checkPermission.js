/**
 * Middleware de Verificação de Permissões
 *
 * Este middleware verifica se o usuário possui as permissões necessárias
 * para acessar um recurso específico.
 * 
 * Facilita a transição para um sistema baseado em SSO como Keycloak no futuro.
 */

/**
 * Cria um middleware que verifica se o usuário tem a permissão especificada
 * 
 * @param {string|string[]} requiredPermissions - Permissão ou array de permissões necessárias
 * @returns {Function} Middleware de verificação de permissão
 */
const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    console.log('🔒 Verificando permissões...');
    
    // Se não há permissões requeridas, segue adiante
    if (!requiredPermissions) {
      console.log('✅ Nenhuma permissão específica necessária');
      return next();
    }
    
    // Se o usuário não está autenticado (sem permissões definidas)
    if (!req.permissions) {
      console.log('❌ Usuário sem permissões definidas');
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este recurso'
      });
    }
    
    // Converte para array caso seja uma única permissão
    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];
    
    // Verifica se o usuário tem permissão de "super usuário"
    if (req.permissions.includes('read:all') || req.permissions.includes('write:all')) {
      console.log('✅ Usuário com permissão de super usuário - acesso liberado');
      return next();
    }
    
    // Verifica se o usuário tem pelo menos uma das permissões requeridas
    const hasPermission = permissions.some(permission => 
      req.permissions.includes(permission)
    );
    
    if (hasPermission) {
      console.log('✅ Usuário possui as permissões necessárias:', permissions);
      return next();
    }
    
    console.log('❌ Usuário não possui as permissões necessárias:', permissions);
    res.status(403).json({
      success: false,
      message: 'Você não tem permissão para acessar este recurso'
    });
  };
};

/**
 * Middleware para restringir acesso apenas a administradores
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'administrador') {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a administradores'
    });
  }
  next();
};

/**
 * Middleware para restringir acesso apenas a alunos
 */
const alunoOnly = (req, res, next) => {
  if (req.user?.role !== 'aluno') {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a alunos'
    });
  }
  next();
};

/**
 * Middleware para restringir acesso ao perfil do próprio usuário
 * Útil para impedir que um aluno acesse dados de outro aluno
 */
const ownProfileOnly = (paramName = 'id') => {
  return (req, res, next) => {
    const paramId = parseInt(req.params[paramName]);
    const userId = req.user?.id;

    // Se for admin, permite o acesso
    if (req.user?.role === 'admin') {
      return next();
    }

    // Se não for admin, verifica se é o próprio perfil
    if (!userId || paramId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Você só pode acessar seu próprio perfil'
      });
    }
    next();
  };
};

module.exports = {
  checkPermission,
  adminOnly,
  alunoOnly,
  ownProfileOnly
}; 