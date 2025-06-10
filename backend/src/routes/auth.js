/**
 * Rotas de Autenticação
 * 
 * Este módulo define todas as rotas relacionadas à autenticação
 * no sistema, incluindo login, registro e validação de tokens.
 * 
 * A estrutura está preparada para futura integração com SSO.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { adminOnly } = require('../middleware/checkPermission');

// Documentação das rotas públicas e privadas
/**
 * Rotas Públicas (não necessitam de autenticação)
 */

// Rota de login para alunos
// router.post('/aluno/loginAdministradors', authController.loginAluno);

// Rota de login unificado (novo fluxo)
router.post('/login', authController.loginUnificado);

// Rota de registro de administradores
router.post('/register', authController.registrar);

/**
 * Rotas Privadas (necessitam de autenticação)
 */

// Rota para validar token
router.get('/validate', authMiddleware, (req, res) => {
  res.json({ 
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    },
    permissions: req.permissions || []
  });
});

// Rota para obter dados do usuário autenticado
router.get('/me', authMiddleware, authController.me);

// Rotas administrativas (apenas administradores)
router.get('/admin/dashboard', authMiddleware, adminOnly, (req, res) => {
  res.json({ 
    message: 'Acesso ao painel administrativo autorizado',
    admin: {
      id: req.admin.id,
      nome: req.admin.nome
    }
  });
});

module.exports = router; 