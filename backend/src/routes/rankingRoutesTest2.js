const express = require('express');
const { QueryTypes } = require('sequelize');
const db = require('../db');
const router = express.Router();

// Controller que consulta a tabela ranking_semanal real
const obterRanking = async (req, res) => {
  try {
    const { limite = 50, pagina = 1 } = req.query;
    const offset = (pagina - 1) * limite;

    // Consulta a tabela ranking_semanal real
    const ranking = await db.query(`
      SELECT 
        posicao,
        nome_usuario,
        total_questoes,
        total_acertos,
        percentual_acerto,
        pontuacao_final
      FROM public.ranking_semanal 
      WHERE semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
      ORDER BY posicao
      LIMIT :limite OFFSET :offset
    `, {
      replacements: { limite: parseInt(limite), offset: parseInt(offset) },
      type: QueryTypes.SELECT
    });

    // Conta total de alunos no ranking
    const totalResult = await db.query(`
      SELECT COUNT(*) as total
      FROM public.ranking_semanal 
      WHERE semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
    `, {
      type: QueryTypes.SELECT
    });

    const totalAlunos = totalResult[0]?.total || 0;
    const totalPaginas = Math.ceil(totalAlunos / limite);

    // Calcula início e fim da semana atual
    const semanaInicio = new Date();
    semanaInicio.setDate(semanaInicio.getDate() - semanaInicio.getDay() + 1); // Segunda-feira
    const semanaFim = new Date(semanaInicio);
    semanaFim.setDate(semanaFim.getDate() + 6); // Domingo

    res.json({
      success: true,
      message: 'Ranking carregado com sucesso!',
      data: {
        ranking,
        paginacao: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total: totalAlunos,
          totalPaginas,
          temProxima: pagina < totalPaginas,
          temAnterior: pagina > 1
        },
        semana: {
          inicio: semanaInicio.toISOString().split('T')[0],
          fim: semanaFim.toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    console.error('Erro ao obter ranking:', error);
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
          nome_usuario: "Usuário Teste",
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

router.get('/', obterRanking);
router.get('/meu-ranking', obterMeuRanking);

module.exports = router;
