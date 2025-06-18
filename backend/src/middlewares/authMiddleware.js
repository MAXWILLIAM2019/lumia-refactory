/**
 * Middleware de Autenticação
 * 
 * Este middleware verifica se o usuário está autenticado
 * através do token JWT enviado no cabeçalho da requisição.
 */
const jwt = require('jsonwebtoken');

/**
 * Middleware que valida o token JWT
 * 
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 * @param {Function} next - Função para passar para o próximo middleware
 */
const authMiddleware = (req, res, next) => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] 🔐 Middleware de autenticação iniciado`);
  console.log(`[${timestamp}] 🔄 Método da requisição: ${req.method}`);
  console.log(`[${timestamp}] 🌐 URL da requisição: ${req.originalUrl}`);
  
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  
  // Se não houver token, retornar erro
  if (!authHeader) {
    console.log(`[${timestamp}] ❌ Token não fornecido`);
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  // O token geralmente é enviado como "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    console.log(`[${timestamp}] ❌ Erro no formato do token`);
    return res.status(401).json({ message: 'Erro no formato do token' });
  }
  
  const [scheme, token] = parts;
  
  // Verificar se o formato do token começa com Bearer
  if (!/^Bearer$/i.test(scheme)) {
    console.log(`[${timestamp}] ❌ Formato de token inválido`);
    return res.status(401).json({ message: 'Formato de token inválido' });
  }
  
  // Verificar se o token é válido
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(`[${timestamp}] ❌ Token inválido:`, err.message);
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    // Extrair informações do token decodificado
    const userInfo = {
      id: decoded.id,
      role: decoded.role,
      isImpersonating: decoded.isImpersonating || false
    };

    // Se estiver em modo de impersonation, adicionar informações originais
    if (decoded['sis-mentoria']?.impersonating) {
      userInfo.originalId = decoded['sis-mentoria'].impersonating.originalId;
      userInfo.originalRole = decoded['sis-mentoria'].impersonating.originalRole;
      console.log(`[${timestamp}] 👥 Modo impersonation detectado:`, {
        aluno: userInfo.id,
        admin_original: userInfo.originalId,
        papel_original: userInfo.originalRole
      });
    }

    // Adicionar informações à requisição
    req.user = userInfo;
    
    console.log(`[${timestamp}] 👤 Informações do usuário:`, {
      ...userInfo,
      url: req.originalUrl,
      method: req.method
    });
    
    // Continuar para o próximo middleware ou rota
    return next();
  });
};

module.exports = authMiddleware; 