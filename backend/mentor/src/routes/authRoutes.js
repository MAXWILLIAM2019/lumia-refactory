const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de autenticação está funcionando!' });
});

// Login
router.post('/login', authController.login);

// Registro
router.post('/register', authController.registrar);

// Dados do administrador
router.get('/me', auth, authController.me);

module.exports = router; 