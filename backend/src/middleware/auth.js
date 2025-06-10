/**
 * Middleware de Autenticação
 * 
 * Verifica se o usuário está autenticado através do token JWT.
 * Este middleware é aplicado às rotas protegidas.
 * Suporta autenticação de administradores e alunos.
 * 
 * Projetado para ser compatível com futura integração SSO (Keycloak).
 */
const authService = require('../services/authService');
const Administrador = require('../models/Administrador');
const Aluno = require('../models/Aluno');
const AdministradorInfo = require('../models/AdministradorInfo');
const Usuario = require('../models/Usuario');
const AlunoInfo = require('../models/AlunoInfo');

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
      // Verifica o token usando o serviço de autenticação
      const decoded = authService.verificarToken(token);
      console.log('✅ Token verificado com sucesso:', decoded);
      
      // Armazena o payload decodificado no request
      req.user = decoded;
      
      // Verifica o tipo de usuário (role) e busca os dados correspondentes
      if (decoded.role === 'administrador') {
        // Caso seja um administrador
        const admin = await AdministradorInfo.findOne({
          where: { IdUsuario: decoded.id },
          include: [{ model: Usuario, as: 'usuario' }]
        });
        
        if (!admin) {
          console.log('❌ Administrador não encontrado para o ID:', decoded.id);
          return res.status(401).json({
            success: false,
            message: 'Token inválido - administrador não encontrado'
          });
        }
        
        console.log('👤 Administrador autenticado:', admin.usuario?.login);
        
        // Mantém a compatibilidade com código existente que pode estar usando req.admin
        req.admin = admin;
      } 
      else if (decoded.role === 'aluno') {
        // Caso seja um aluno
        const aluno = await AlunoInfo.findOne({
          where: { IdUsuario: decoded.id },
          include: [{ model: Usuario, as: 'usuario' }]
        });
        
        if (!aluno) {
          console.log('❌ Aluno não encontrado para o ID:', decoded.id);
          return res.status(401).json({
            success: false,
            message: 'Token inválido - aluno não encontrado'
          });
        }
        
        console.log('👤 Aluno autenticado:', aluno.usuario?.login);
        
        // Adiciona o aluno ao request para uso posterior
        req.aluno = aluno;
      }
      else {
        // Caso o role não seja reconhecido
        console.log('❌ Perfil de usuário não reconhecido:', decoded.role);
        return res.status(401).json({
          success: false,
          message: 'Token inválido - perfil não reconhecido'
        });
      }
      
      // Para facilitar verificações futuras, adiciona as permissões ao request
      req.permissions = decoded['sis-mentoria']?.permissions || [];
      
      console.log('✅ Autenticação concluída com sucesso');
      console.log('🔑 Permissões do usuário:', req.permissions);
      
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
    res.status(500).json({
      success: false,
      message: 'Falha na autenticação',
      details: error.message
    });
  }
};

module.exports = auth; 