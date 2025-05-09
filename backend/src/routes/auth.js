const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Rota de login
router.post('/login', authController.login);

// Rota de registro
router.post('/register', authController.register);

// Rota para validar token
router.get('/validate', authMiddleware, (req, res) => {
  res.json({ valid: true });
});

// Rota para obter dados do usuário
router.get('/me', authMiddleware, authController.getMe);

module.exports = router; 