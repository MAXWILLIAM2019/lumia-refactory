/**
 * Serviço de Autenticação
 * 
 * Esta camada de abstração gerencia a autenticação de usuários
 * independente do provedor (local ou SSO).
 * Futuramente pode ser integrado com Keycloak ou outro provedor SSO.
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Administrador = require('../models/Administrador');
const Aluno = require('../models/Aluno');

/**
 * Configurações de autenticação
 * No futuro, isso poderia vir de variáveis de ambiente ou
 * ser substituído pela configuração do Keycloak
 */
const AUTH_CONFIG = {
  tokenExpiresIn: '24h',
  jwtSecret: process.env.JWT_SECRET,
  // Quando migrar para SSO, adicionar aqui as URLs do servidor de autenticação
  // ssoServerUrl: process.env.SSO_SERVER_URL,
  // ssoRealm: process.env.SSO_REALM,
  // ssoClientId: process.env.SSO_CLIENT_ID,
};

/**
 * Gera token JWT para um usuário
 * 
 * @param {Object} usuario - Dados do usuário
 * @param {string} role - Papel do usuário no sistema (admin, aluno, mentor, etc)
 * @returns {string} Token JWT
 */
const gerarToken = (usuario, role) => {
  // Dados comuns a todos os tipos de usuário que serão incluídos no token
  const payload = {
    id: usuario.id,
    email: usuario.email,
    role,
    // Preparando para futuras integrações, adicionamos um namespace personalizado
    // que pode ser usado para armazenar dados específicos da aplicação
    'sis-mentoria': {
      // Aqui podemos adicionar claims personalizados que seriam úteis
      // em uma implementação SSO
      role_name: role === 'admin' ? 'Administrador' : 
                 role === 'aluno' ? 'Aluno' : 'Usuário',
      permissions: getPermissionsForRole(role)
    }
  };
  
  return jwt.sign(payload, AUTH_CONFIG.jwtSecret, { 
    expiresIn: AUTH_CONFIG.tokenExpiresIn 
  });
};

/**
 * Retorna as permissões básicas para cada papel (role)
 * Isso facilita a futura migração para um sistema baseado em permissões
 * 
 * @param {string} role - Papel do usuário
 * @returns {Array} Lista de permissões
 */
const getPermissionsForRole = (role) => {
  switch (role) {
    case 'admin':
      return ['read:all', 'write:all', 'manage:users', 'manage:plans'];
    case 'aluno':
      return ['read:own_profile', 'read:assigned_plans', 'submit:activities'];
    case 'mentor':
      return ['read:students', 'read:plans', 'write:activities', 'review:submissions'];
    default:
      return ['read:public'];
  }
};

/**
 * Verifica se um usuário existe e se a senha está correta
 * 
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha em texto puro
 * @param {string} tipo - Tipo de usuário ('admin', 'aluno', etc)
 * @returns {Object|null} Objeto com usuário se autenticado, null caso contrário
 */
const verificarCredenciais = async (email, senha, tipo) => {
  try {
    let usuario;
    
    // Busca o usuário de acordo com seu tipo
    if (tipo === 'admin') {
      usuario = await Administrador.findOne({ where: { email } });
    } else if (tipo === 'aluno') {
      usuario = await Aluno.findOne({ where: { email } });
    } else {
      throw new Error(`Tipo de usuário não suportado: ${tipo}`);
    }
    
    // Verifica se o usuário existe
    if (!usuario) {
      return null;
    }
    
    // Verifica se o usuário tem senha definida
    if (!usuario.senha) {
      return null;
    }
    
    // Verifica se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return null;
    }
    
    return usuario;
  } catch (error) {
    console.error(`Erro ao verificar credenciais para ${tipo}:`, error);
    throw error;
  }
};

/**
 * Realiza o login de um usuário
 * 
 * @param {Object} credentials - Credenciais do usuário
 * @param {string} tipo - Tipo de usuário ('admin', 'aluno', etc)
 * @returns {Object} Dados do usuário e token
 */
const realizarLogin = async (credentials, tipo) => {
  try {
    const { email, senha } = credentials;
    
    // Verifica as credenciais
    const usuario = await verificarCredenciais(email, senha, tipo);
    
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }
    
    // Gera o token JWT
    const token = gerarToken(usuario, tipo);
    
    // Remove a senha do objeto de resposta por segurança
    const usuarioSemSenha = usuario.toJSON();
    delete usuarioSemSenha.senha;
    
    return {
      success: true,
      token,
      usuario: usuarioSemSenha,
      tipo
    };
  } catch (error) {
    console.error(`Erro no login de ${tipo}:`, error);
    throw error;
  }
};

/**
 * Verifica se um token é válido e retorna os dados do payload
 * 
 * @param {string} token - Token JWT a ser verificado
 * @returns {Object} Payload do token
 */
const verificarToken = (token) => {
  try {
    return jwt.verify(token, AUTH_CONFIG.jwtSecret);
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    throw error;
  }
};

module.exports = {
  realizarLogin,
  verificarToken,
  gerarToken,
  getPermissionsForRole,
}; 