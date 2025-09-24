/**
 * Serviço de Ranking
 * 
 * Responsável por todas as operações relacionadas ao ranking de alunos.
 * Integra com a API do backend para obter dados em tempo real.
 */

import api from './api';

/**
 * Classe para gerenciar operações de ranking
 */
class RankingService {
  /**
   * Obtém o ranking completo dos alunos
   * @param {number} limite - Número máximo de alunos a retornar (padrão: 50)
   * @param {number} pagina - Página para paginação (padrão: 1)
   * @returns {Promise<Object>} Dados do ranking
   */
  async obterRanking(limite = 50, pagina = 1) {
    try {
      const response = await api.get('/ranking', {
        params: {
          limite,
          pagina
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao obter ranking:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar ranking'
      };
    }
  }

  /**
   * Obtém a posição do usuário logado no ranking
   * @returns {Promise<Object>} Posição do usuário
   */
  async obterMeuRanking() {
    try {
      const response = await api.get('/ranking/meu-ranking');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao obter meu ranking:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar sua posição'
      };
    }
  }

  /**
   * Obtém estatísticas do ranking atual
   * @returns {Promise<Object>} Estatísticas do ranking
   */
  async obterEstatisticas() {
    try {
      const response = await api.get('/ranking/estatisticas');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar estatísticas'
      };
    }
  }

  /**
   * Calcula o tempo restante para o próximo reset do ranking
   * O ranking reinicia toda segunda-feira às 02:00
   * @returns {Object} Tempo restante em dias, horas, minutos e segundos
   */
  calcularTempoRestante() {
    const agora = new Date();
    const proximaSegunda = new Date(agora);
    
    // Encontra a próxima segunda-feira às 02:00
    const diasParaSegunda = (1 - agora.getDay() + 7) % 7;
    proximaSegunda.setDate(agora.getDate() + diasParaSegunda);
    proximaSegunda.setHours(2, 0, 0, 0); // 02:00 da manhã
    
    // Se já passou da segunda-feira às 02:00 desta semana, pega a próxima
    if (agora.getDay() === 1 && agora.getHours() >= 2) {
      proximaSegunda.setDate(proximaSegunda.getDate() + 7);
    }
    
    const diferenca = proximaSegunda.getTime() - agora.getTime();
    
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
    
    return {
      days: Math.max(0, dias),
      hours: Math.max(0, horas),
      minutes: Math.max(0, minutos),
      seconds: Math.max(0, segundos)
    };
  }

  /**
   * Formata dados do ranking para o componente
   * @param {Array} rankingData - Dados brutos do ranking
   * @param {Object} meuRanking - Posição do usuário logado
   * @returns {Object} Dados formatados para o componente
   */
  formatarDadosRanking(rankingData, meuRanking = null) {
    if (!rankingData || rankingData.length === 0) {
      return {
        top3: [],
        list: []
      };
    }

    // Separa top 3 do resto
    const top3 = rankingData.slice(0, 3).map((item, index) => ({
      position: item.posicao,
      initials: this.gerarIniciais(item.nome_usuario),
      name: this.ocultarNome(item.nome_usuario),
      performance: parseFloat(item.percentual_acerto).toFixed(1),
      totalQuestions: item.total_questoes,
      trophy: ['gold', 'silver', 'bronze'][index]
    }));

    // Lista completa (excluindo 2º e 3º colocados, exceto se for o usuário logado)
    const list = rankingData
      .filter(item => {
        // Inclui todos os alunos, exceto 2º e 3º colocados
        // Mas se for o usuário logado, inclui independente da posição
        if (item.nome_usuario === meuRanking?.nome_usuario) {
          return true; // Usuário logado sempre incluído
        }
        return item.posicao > 3; // Apenas posições 4+ (exclui 1º, 2º e 3º)
      })
      .map(item => ({
        position: item.posicao,
        initials: this.gerarIniciais(item.nome_usuario),
        name: item.nome_usuario === meuRanking?.nome_usuario ? `Você (${item.nome_usuario})` : this.ocultarNome(item.nome_usuario),
        performance: parseFloat(item.percentual_acerto).toFixed(1),
        totalQuestions: item.total_questoes,
        change: 'up' // TODO: Implementar lógica de mudança de posição
      }));

    // Se o usuário logado estiver no ranking, move ele para o início da lista
    if (meuRanking && meuRanking.posicao) {
      const minhaPosicao = list.find(item => item.name.includes('Você ('));
      if (minhaPosicao) {
        // Remove a posição do usuário da lista
        const listSemUsuario = list.filter(item => !item.name.includes('Você ('));
        // Adiciona o usuário no início da lista
        listSemUsuario.unshift(minhaPosicao);
        return {
          top3,
          list: listSemUsuario.slice(0, 20) // Limita a 20 itens na lista
        };
      }
    }

    return {
      top3,
      list: list.slice(0, 20) // Limita a 20 itens na lista
    };
  }

  /**
   * Gera iniciais a partir do nome
   * @param {string} nome - Nome completo
   * @returns {string} Iniciais
   */
  gerarIniciais(nome) {
    if (!nome) return '??';
    
    const palavras = nome.trim().split(' ');
    if (palavras.length >= 2) {
      return (palavras[0][0] + palavras[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }

  /**
   * Oculta parte do nome para privacidade
   * @param {string} nome - Nome completo
   * @returns {string} Nome com partes ocultadas
   */
  ocultarNome(nome) {
    if (!nome) return 'Nome não disponível';
    
    const palavras = nome.trim().split(' ');
    if (palavras.length >= 2) {
      const primeiro = palavras[0];
      const ultimo = palavras[palavras.length - 1];
      
      return `${primeiro} ${ultimo.charAt(0)}${'*'.repeat(Math.max(1, ultimo.length - 1))}`;
    }
    
    return nome.charAt(0) + '*'.repeat(Math.max(1, nome.length - 1));
  }
}

// Exporta uma instância única do serviço
export default new RankingService();


