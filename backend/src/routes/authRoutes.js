const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de autenticação está funcionando!' });
});

/**
 * @route   POST /auth/register
 * @desc    Registra um novo usuário
 * @access  Public
 */
router.post('/register', authController.registrar);

/**
 * @route   POST /auth/login
 * @desc    Autentica um usuário
 * @access  Public
 */
router.post('/login', authController.loginUnificado);

/**
 * @route   GET /auth/me
 * @desc    Retorna os dados do usuário logado
 * @access  Private
 */
router.get('/me', auth, authController.me);

/**
 * @route   POST /auth/impersonate/:id
 * @desc    Gera um token de impersonation para um administrador acessar como aluno
 * @access  Private/Admin
 */
router.post('/impersonate/:id', auth, adminOnly, authController.impersonateUser);

module.exports = router; 