const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de autenticação está funcionando!' });
});

// Login de administrador
router.post('/login', authController.login);

// Login de aluno
router.post('/aluno/login', authController.loginAluno);

// Registro
router.post('/register', authController.registrar);

// Dados do usuário autenticado
router.get('/me', auth, authController.me);

module.exports = router; 