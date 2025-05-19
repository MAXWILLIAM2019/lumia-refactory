/**
 * Índice de Middlewares
 * 
 * Este arquivo centraliza a exportação de todos os middlewares da aplicação.
 * Isso facilita a importação e uso consistente dos middlewares em todo o código.
 */

const auth = require('./auth');
const { 
  checkPermission, 
  adminOnly, 
  alunoOnly, 
  ownProfileOnly 
} = require('./checkPermission');

module.exports = {
  // Autenticação básica
  auth,
  
  // Controle de permissões
  checkPermission,
  adminOnly,
  alunoOnly,
  ownProfileOnly,
  
  // Atalhos para permissões comuns
  readOnly: checkPermission(['read:all', 'read:own_profile']),
  writeOnly: checkPermission(['write:all']),
}; 