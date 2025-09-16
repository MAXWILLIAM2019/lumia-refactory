const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Controller simples inline
const obterRanking = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'API de ranking funcionando!',
      data: {
        ranking: [
          {
            posicao: 1,
            nome_usuario: "João Silva",
            total_questoes: 25,
            total_acertos: 20,
            percentual_acerto: 80.00,
            pontuacao_final: 205.50
          },
          {
            posicao: 2,
            nome_usuario: "Maria Santos",
            total_questoes: 20,
            total_acertos: 18,
            percentual_acerto: 90.00,
            pontuacao_final: 189.00
          }
        ],
        paginacao: {
          pagina: 1,
          limite: 50,
          total: 2,
          totalPaginas: 1,
          temProxima: false,
          temAnterior: false
        },
        semana: {
          inicio: "2024-01-15",
          fim: "2024-01-21"
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const obterMeuRanking = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        posicao: {
          posicao: 1,
          nome_usuario: req.user.nome || "Usuário Logado",
          total_questoes: 15,
          total_acertos: 12,
          percentual_acerto: 80.00,
          pontuacao_final: 126.00
        },
        semana: {
          inicio: "2024-01-15",
          fim: "2024-01-21"
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

router.get('/', auth, obterRanking);
router.get('/meu-ranking', auth, obterMeuRanking);

module.exports = router;

