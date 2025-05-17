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
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  
  // Se não houver token, retornar erro
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  // O token geralmente é enviado como "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Erro no formato do token' });
  }
  
  const [scheme, token] = parts;
  
  // Verificar se o formato do token começa com Bearer
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Formato de token inválido' });
  }
  
  // Verificar se o token é válido
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    // Se o token for válido, salvar o payload decodificado na requisição
    // para uso posterior (ex.: req.userId para acesso ao ID do usuário)
    req.userId = decoded.id;
    
    // Continuar para o próximo middleware ou rota
    return next();
  });
};

module.exports = authMiddleware; 