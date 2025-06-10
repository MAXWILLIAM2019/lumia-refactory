const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de autenticação está funcionando!' });
});

// Rota de login unificado
router.post('/login', authController.loginUnificado);

// Registro
router.post('/register', authController.registrar);

// Dados do usuário autenticado
router.get('/me', auth, authController.me);

module.exports = router; 