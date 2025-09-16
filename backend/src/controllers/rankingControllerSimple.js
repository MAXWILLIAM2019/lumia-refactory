const { QueryTypes } = require('sequelize');
const db = require('../db');

/**
 * Controller simplificado para operações de ranking
 * Versão sem dependência do node-cron
 */
class RankingControllerSimple {
  
  /**
   * Obtém ranking global semanal
   * GET /api/ranking
   */
  async obterRanking(req, res) {
    try {
      const { limite = 50, pagina = 1 } = req.query;
      const offset = (pagina - 1) * limite;

      // Query direta para obter ranking
      const ranking = await db.query(`
        SELECT 
          ROW_NUMBER() OVER (ORDER BY 
            (COALESCE(SUM(
              CASE 
                WHEN a.status = 'CONCLUIDA' AND a.pontuacao > 0 THEN 1 
                ELSE 0 
              END
            ), 0) * 10.0) + 
            (CASE 
              WHEN COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' THEN 1 
                  ELSE 0 
                END
              ), 0) > 0 
              THEN (COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' AND a.pontuacao > 0 THEN 1 
                  ELSE 0 
                END
              ), 0) * 100.0) / 
              COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' THEN 1 
                  ELSE 0 
                END
              ), 1) * 0.5
              ELSE 0.00
            END) +
            (COALESCE(SUM(
              CASE 
                WHEN a.status = 'CONCLUIDA' THEN 1 
                ELSE 0 
              END
            ), 0) * 0.1) DESC,
            COALESCE(SUM(
              CASE 
                WHEN a.status = 'CONCLUIDA' THEN 1 
                ELSE 0 
              END
            ), 0) DESC
          ) as posicao,
          u.idusuario,
          u.nome as nome_usuario,
          COALESCE(SUM(
            CASE 
              WHEN a.status = 'CONCLUIDA' THEN 1 
              ELSE 0 
            END
          ), 0) as total_questoes,
          COALESCE(SUM(
            CASE 
              WHEN a.status = 'CONCLUIDA' AND a.pontuacao > 0 THEN 1 
              ELSE 0 
            END
          ), 0) as total_acertos,
          CASE 
            WHEN COALESCE(SUM(
              CASE 
                WHEN a.status = 'CONCLUIDA' THEN 1 
                ELSE 0 
              END
            ), 0) > 0 
            THEN ROUND(
              (COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' AND a.pontuacao > 0 THEN 1 
                  ELSE 0 
                END
              ), 0) * 100.0) / 
              COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' THEN 1 
                  ELSE 0 
                END
              ), 1), 2
            )
            ELSE 0.00
          END as percentual_acerto,
          ROUND(
            (COALESCE(SUM(
              CASE 
                WHEN a.status = 'CONCLUIDA' AND a.pontuacao > 0 THEN 1 
                ELSE 0 
              END
            ), 0) * 10.0) + 
            (CASE 
              WHEN COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' THEN 1 
                  ELSE 0 
                END
              ), 0) > 0 
              THEN (COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' AND a.pontuacao > 0 THEN 1 
                  ELSE 0 
                END
              ), 0) * 100.0) / 
              COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' THEN 1 
                  ELSE 0 
                END
              ), 1) * 0.5
              ELSE 0.00
            END) +
            (COALESCE(SUM(
              CASE 
                WHEN a.status = 'CONCLUIDA' THEN 1 
                ELSE 0 
              END
            ), 0) * 0.1), 2
          ) as pontuacao_final
        FROM public.usuario u
        LEFT JOIN public.atividade a ON u.idusuario = a.idusuario
          AND a.data_criacao >= DATE_TRUNC('week', CURRENT_DATE)
          AND a.data_criacao < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
        WHERE u.ativo = true
        GROUP BY u.idusuario, u.nome
        HAVING COALESCE(SUM(
          CASE 
            WHEN a.status = 'CONCLUIDA' THEN 1 
            ELSE 0 
          END
        ), 0) > 0
        ORDER BY pontuacao_final DESC, total_questoes DESC
        LIMIT :limite OFFSET :offset
      `, {
        replacements: { limite: parseInt(limite), offset: parseInt(offset) },
        type: QueryTypes.SELECT
      });

      // Conta total de alunos
      const totalResult = await db.query(`
        SELECT COUNT(*) as total
        FROM public.usuario u
        LEFT JOIN public.atividade a ON u.idusuario = a.idusuario
          AND a.data_criacao >= DATE_TRUNC('week', CURRENT_DATE)
          AND a.data_criacao < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
        WHERE u.ativo = true
        GROUP BY u.idusuario
        HAVING COALESCE(SUM(
          CASE 
            WHEN a.status = 'CONCLUIDA' THEN 1 
            ELSE 0 
          END
        ), 0) > 0
      `, {
        type: QueryTypes.SELECT
      });

      const totalAlunos = totalResult.length;
      const totalPaginas = Math.ceil(totalAlunos / limite);

      res.json({
        success: true,
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
            inicio: this.obterInicioSemana(),
            fim: this.obterFimSemana()
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
  }

  /**
   * Obtém posição do usuário logado
   * GET /api/ranking/meu-ranking
   */
  async obterMeuRanking(req, res) {
    try {
      const idUsuario = req.user.id;

      const posicao = await db.query(`
        SELECT 
          ROW_NUMBER() OVER (ORDER BY 
            (COALESCE(SUM(
              CASE 
                WHEN a.status = 'CONCLUIDA' AND a.pontuacao > 0 THEN 1 
                ELSE 0 
              END
            ), 0) * 10.0) + 
            (CASE 
              WHEN COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' THEN 1 
                  ELSE 0 
                END
              ), 0) > 0 
              THEN (COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' AND a.pontuacao > 0 THEN 1 
                  ELSE 0 
                END
              ), 0) * 100.0) / 
              COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' THEN 1 
                  ELSE 0 
                END
              ), 1) * 0.5
              ELSE 0.00
            END) +
            (COALESCE(SUM(
              CASE 
                WHEN a.status = 'CONCLUIDA' THEN 1 
                ELSE 0 
              END
            ), 0) * 0.1) DESC
          ) as posicao,
          u.idusuario,
          u.nome as nome_usuario,
          COALESCE(SUM(
            CASE 
              WHEN a.status = 'CONCLUIDA' THEN 1 
              ELSE 0 
            END
          ), 0) as total_questoes,
          COALESCE(SUM(
            CASE 
              WHEN a.status = 'CONCLUIDA' AND a.pontuacao > 0 THEN 1 
              ELSE 0 
            END
          ), 0) as total_acertos,
          CASE 
            WHEN COALESCE(SUM(
              CASE 
                WHEN a.status = 'CONCLUIDA' THEN 1 
                ELSE 0 
              END
            ), 0) > 0 
            THEN ROUND(
              (COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' AND a.pontuacao > 0 THEN 1 
                  ELSE 0 
                END
              ), 0) * 100.0) / 
              COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' THEN 1 
                  ELSE 0 
                END
              ), 1), 2
            )
            ELSE 0.00
          END as percentual_acerto,
          ROUND(
            (COALESCE(SUM(
              CASE 
                WHEN a.status = 'CONCLUIDA' AND a.pontuacao > 0 THEN 1 
                ELSE 0 
              END
            ), 0) * 10.0) + 
            (CASE 
              WHEN COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' THEN 1 
                  ELSE 0 
                END
              ), 0) > 0 
              THEN (COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' AND a.pontuacao > 0 THEN 1 
                  ELSE 0 
                END
              ), 0) * 100.0) / 
              COALESCE(SUM(
                CASE 
                  WHEN a.status = 'CONCLUIDA' THEN 1 
                  ELSE 0 
                END
              ), 1) * 0.5
              ELSE 0.00
            END) +
            (COALESCE(SUM(
              CASE 
                WHEN a.status = 'CONCLUIDA' THEN 1 
                ELSE 0 
              END
            ), 0) * 0.1), 2
          ) as pontuacao_final
        FROM public.usuario u
        LEFT JOIN public.atividade a ON u.idusuario = a.idusuario
          AND a.data_criacao >= DATE_TRUNC('week', CURRENT_DATE)
          AND a.data_criacao < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
        WHERE u.idusuario = :idUsuario
        GROUP BY u.idusuario, u.nome
        HAVING COALESCE(SUM(
          CASE 
            WHEN a.status = 'CONCLUIDA' THEN 1 
            ELSE 0 
          END
        ), 0) > 0
      `, {
        replacements: { idUsuario },
        type: QueryTypes.SELECT
      });

      if (posicao.length === 0) {
        return res.json({
          success: true,
          data: {
            posicao: null,
            message: 'Você ainda não apareceu no ranking desta semana. Complete algumas atividades!',
            semana: {
              inicio: this.obterInicioSemana(),
              fim: this.obterFimSemana()
            }
          }
        });
      }

      res.json({
        success: true,
        data: {
          posicao: posicao[0],
          semana: {
            inicio: this.obterInicioSemana(),
            fim: this.obterFimSemana()
          }
        }
      });

    } catch (error) {
      console.error('Erro ao obter meu ranking:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Utilitário: Obtém início da semana atual
   */
  obterInicioSemana() {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const diferenca = diaSemana === 0 ? -6 : 1 - diaSemana; // Segunda-feira
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() + diferenca);
    return inicioSemana.toISOString().split('T')[0];
  }

  /**
   * Utilitário: Obtém fim da semana atual
   */
  obterFimSemana() {
    const inicioSemana = new Date(this.obterInicioSemana());
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6); // Domingo
    return fimSemana.toISOString().split('T')[0];
  }
}

module.exports = new RankingControllerSimple();
