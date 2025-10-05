import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RankingSemanal } from '../entities/rankingSemanal.entity';
import { RankingQueryDto } from '../dto/rankingQuery.dto';
import { RankingResponseDto, MeuRankingResponseDto } from '../dto/rankingResponse.dto';

@Injectable()
export class ServicoRanking {
  constructor(
    @InjectRepository(RankingSemanal)
    private rankingRepository: Repository<RankingSemanal>,
    private dataSource: DataSource,
  ) {}

  // ===== MÉTODOS PARA RANKING =====

  async obterRanking(query: RankingQueryDto): Promise<RankingResponseDto> {
    const { limite = 50, pagina = 1 } = query;
    const offset = (pagina - 1) * limite;

    // Consulta a tabela ranking_semanal real
    const ranking = await this.dataSource.query(`
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
      LIMIT $1 OFFSET $2
    `, [limite, offset]);

    // Conta total de alunos no ranking
    const totalResult = await this.dataSource.query(`
      SELECT COUNT(*) as total
      FROM public.ranking_semanal 
      WHERE semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
    `);

    const totalAlunos = parseInt(totalResult[0]?.total) || 0;
    const totalPaginas = Math.ceil(totalAlunos / limite);

    // Calcula início e fim da semana atual
    const semanaInicio = new Date();
    semanaInicio.setDate(semanaInicio.getDate() - semanaInicio.getDay() + 1); // Segunda-feira
    const semanaFim = new Date(semanaInicio);
    semanaFim.setDate(semanaFim.getDate() + 6); // Domingo

    return {
      success: true,
      message: 'Ranking carregado com sucesso!',
      data: {
        ranking,
        paginacao: {
          pagina: parseInt(pagina.toString()),
          limite: parseInt(limite.toString()),
          total: totalAlunos,
          totalPaginas,
          temProxima: pagina < totalPaginas,
          temAnterior: pagina > 1,
        },
        semana: {
          inicio: semanaInicio.toISOString().split('T')[0],
          fim: semanaFim.toISOString().split('T')[0],
        },
      },
    };
  }

  async obterMeuRanking(usuarioId: number): Promise<MeuRankingResponseDto> {
    // Consulta a posição do usuário no ranking atual
    const meuRanking = await this.dataSource.query(`
      SELECT 
        posicao,
        nome_usuario,
        total_questoes,
        total_acertos,
        percentual_acerto,
        pontuacao_final
      FROM public.ranking_semanal 
      WHERE id_usuario = $1 
        AND semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
    `, [usuarioId]);

    if (meuRanking.length === 0) {
      return {
        success: true,
        data: null,
        message: 'Usuário não encontrado no ranking desta semana',
      };
    }

    // Calcula início e fim da semana atual
    const semanaInicio = new Date();
    semanaInicio.setDate(semanaInicio.getDate() - semanaInicio.getDay() + 1); // Segunda-feira
    const semanaFim = new Date(semanaInicio);
    semanaFim.setDate(semanaFim.getDate() + 6); // Domingo

    return {
      success: true,
      data: {
        posicao: meuRanking[0],
        semana: {
          inicio: semanaInicio.toISOString().split('T')[0],
          fim: semanaFim.toISOString().split('T')[0],
        },
      },
    };
  }

  // ===== MÉTODOS PARA JOB DE ATUALIZAÇÃO =====

  async executarAtualizacaoRanking(): Promise<void> {
    try {
      console.log('🔄 Iniciando atualização do ranking semanal...');

      // Chama a função PostgreSQL para atualizar ranking
      await this.dataSource.query('SELECT public.atualizar_ranking_semanal()');

      console.log('✅ Ranking atualizado com sucesso');

      // Log de estatísticas
      await this.logEstatisticas();
    } catch (error) {
      console.error('❌ Erro ao atualizar ranking:', error);
      throw error;
    }
  }

  async executarLimpezaRanking(): Promise<void> {
    try {
      console.log('🧹 Iniciando limpeza de ranking antigo...');

      // Chama a função PostgreSQL para limpeza
      await this.dataSource.query('SELECT public.limpar_ranking_antigo()');

      console.log('✅ Limpeza de ranking antigo concluída');
    } catch (error) {
      console.error('❌ Erro ao limpar ranking antigo:', error);
      throw error;
    }
  }

  async obterRankingAtual(limite: number = 50): Promise<any[]> {
    try {
      const ranking = await this.dataSource.query(`
        SELECT 
          posicao,
          nome_usuario,
          total_questoes,
          total_acertos,
          percentual_acerto,
          pontuacao_final,
          ultima_atualizacao
        FROM public.ranking_semanal 
        WHERE semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
        ORDER BY posicao ASC
        LIMIT $1
      `, [limite]);

      return ranking;
    } catch (error) {
      console.error('❌ Erro ao obter ranking:', error);
      throw error;
    }
  }

  async obterPosicaoUsuario(idUsuario: number): Promise<any | null> {
    try {
      const posicao = await this.dataSource.query(`
        SELECT 
          posicao,
          nome_usuario,
          total_questoes,
          total_acertos,
          percentual_acerto,
          pontuacao_final,
          ultima_atualizacao
        FROM public.ranking_semanal 
        WHERE id_usuario = $1 
        AND semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
      `, [idUsuario]);

      return posicao.length > 0 ? posicao[0] : null;
    } catch (error) {
      console.error('❌ Erro ao obter posição do usuário:', error);
      throw error;
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  private async logEstatisticas(): Promise<void> {
    try {
      const stats = await this.dataSource.query(`
        SELECT 
          COUNT(*) as total_alunos,
          AVG(pontuacao_final) as pontuacao_media,
          MAX(pontuacao_final) as pontuacao_maxima,
          MIN(pontuacao_final) as pontuacao_minima,
          SUM(total_questoes) as total_questoes_semana,
          SUM(total_acertos) as total_acertos_semana
        FROM public.ranking_semanal 
        WHERE semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
      `);

      if (stats.length > 0) {
        const stat = stats[0];
        console.log('📊 Estatísticas do ranking:');
        console.log(`   • Total de alunos: ${stat.total_alunos}`);
        console.log(`   • Pontuação média: ${parseFloat(stat.pontuacao_media).toFixed(2)}`);
        console.log(`   • Pontuação máxima: ${parseFloat(stat.pontuacao_maxima).toFixed(2)}`);
        console.log(`   • Total de questões: ${stat.total_questoes_semana}`);
        console.log(`   • Total de acertos: ${stat.total_acertos_semana}`);
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
    }
  }
}
