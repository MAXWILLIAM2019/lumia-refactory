import { useState, useEffect } from 'react';
import styles from './AlunoEstatisticas.module.css';
import api from '../../services/api';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

// Tooltip customizada para o gráfico de pizza
function CustomPieTooltip({ active, payload, dataPie, setShowValues }) {
  // Importar COLORS para dentro da função
  const COLORS = ['#51d7a5', '#c6484d']; // [Verde, Vermelho]
  if (active && payload && payload.length) {
    setShowValues(true);
    // Calcular o total usando o array dataPie completo
    const total = dataPie.reduce((acc, item) => acc + (item.value || 0), 0);
    const current = payload[0];
    const percent = total > 0 ? ((current.value / total) * 100).toFixed(2) : 0;
    // Descobrir o índice da fatia
    const dataIndex = dataPie.findIndex(item => item.name === current.name);
    const color = COLORS[dataIndex % COLORS.length];
    return (
      <div style={{ background: '#f5f6fa', color: '#222', padding: '8px 8px 5px 8px', borderRadius: 6, fontWeight: 'bold', fontSize: 15, display: 'flex', gap: 8 }}>
        <span style={{ display: 'inline-block', width: 18, height: 18, background: color, borderRadius: 3, marginRight: 6, border: '2px solid #222', verticalAlign: 'middle' }}></span>
        {`${current.name}: ${current.value} | ${percent}%`}
      </div>
    );
  } else {
    setShowValues(false);
  }
  return null;
}

export default function AlunoEstatisticas() {
  const [loading, setLoading] = useState(true);
  const [questoesCorretas, setQuestoesCorretas] = useState(0);
  const [questoesErradas, setQuestoesErradas] = useState(0);
  const [showValues, setShowValues] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [abaSelecionada, setAbaSelecionada] = useState(0); // 0: Percentual, 1: Desempenho por meta
  const [nomeSprintAtual, setNomeSprintAtual] = useState('');
  const [dadosDisciplinas, setDadosDisciplinas] = useState([]);
  const [totalAcertos, setTotalAcertos] = useState(0);
  const [totalQuestoes, setTotalQuestoes] = useState(0);
  const [totalPercentual, setTotalPercentual] = useState(0);

  useEffect(() => {
    carregarEstatisticasSprintAtual();
  }, []);

  const carregarEstatisticasSprintAtual = async () => {
    try {
      setLoading(true);
      // Buscar o plano do aluno logado
      const planoResp = await api.get('/aluno-plano/meu-plano');
      if (!planoResp.data || !planoResp.data.planoId) {
        setQuestoesCorretas(0);
        setQuestoesErradas(0);
        setNomeSprintAtual('');
        setDadosDisciplinas([]);
        setTotalAcertos(0);
        setTotalQuestoes(0);
        setTotalPercentual(0);
        setLoading(false);
        return;
      }
      const planoId = planoResp.data.planoId;
      // Buscar sprints do plano
      const sprintsResp = await api.get(`/planos/${planoId}/sprints`);
      const sprints = sprintsResp.data;
      if (!sprints || sprints.length === 0) {
        setQuestoesCorretas(0);
        setQuestoesErradas(0);
        setNomeSprintAtual('');
        setDadosDisciplinas([]);
        setTotalAcertos(0);
        setTotalQuestoes(0);
        setTotalPercentual(0);
        setLoading(false);
        return;
      }
      // Ordenar sprints por posição ou data de início
      const sortedSprints = [...sprints].sort((a, b) => {
        if (a.posicao !== undefined && b.posicao !== undefined) {
          return a.posicao - b.posicao;
        }
        return new Date(a.dataInicio) - new Date(b.dataInicio);
      });
      // Pegar a primeira sprint (a atual)
      const sprintAtual = sortedSprints[0];
      setNomeSprintAtual(sprintAtual.nome || '');
      // Buscar dados completos da sprint
      const sprintDetalhesResp = await api.get(`/sprints/${sprintAtual.id}`);
      const sprintDetalhes = sprintDetalhesResp.data;
      if (!sprintDetalhes || !sprintDetalhes.metas) {
        setQuestoesCorretas(0);
        setQuestoesErradas(0);
        setDadosDisciplinas([]);
        setTotalAcertos(0);
        setTotalQuestoes(0);
        setTotalPercentual(0);
        setLoading(false);
        return;
      }
      // Somar questões corretas e erradas das metas da sprint atual
      let corretas = 0;
      let erradas = 0;
      sprintDetalhes.metas.forEach(meta => {
        corretas += meta.questoesCorretas || 0;
        const total = meta.totalQuestoes || 0;
        erradas += total - (meta.questoesCorretas || 0);
      });
      setQuestoesCorretas(corretas);
      setQuestoesErradas(erradas);

      // Dados reais para a tabela de desempenho por disciplina
      let disciplinasTemp = [];
      if (sprintDetalhes && sprintDetalhes.metas) {
        // Agrupar metas por disciplina
        const agrupado = {};
        sprintDetalhes.metas.forEach(meta => {
          const disciplina = meta.disciplina || '---';
          if (!agrupado[disciplina]) {
            agrupado[disciplina] = { acertos: 0, questoes: 0 };
          }
          agrupado[disciplina].acertos += meta.questoesCorretas || 0;
          agrupado[disciplina].questoes += meta.totalQuestoes || 0;
        });
        disciplinasTemp = Object.entries(agrupado).map(([nome, { acertos, questoes }]) => ({
          nome,
          acertos,
          questoes,
          percentual: questoes > 0 ? ((acertos / questoes) * 100) : 0
        }));
      }
      const acertosTotal = disciplinasTemp.reduce((acc, d) => acc + d.acertos, 0);
      const questoesTotal = disciplinasTemp.reduce((acc, d) => acc + d.questoes, 0);
      const percentualTotal = questoesTotal > 0 ? ((acertosTotal / questoesTotal) * 100).toFixed(1) : 0;

      setDadosDisciplinas(disciplinasTemp);
      setTotalAcertos(acertosTotal);
      setTotalQuestoes(questoesTotal);
      setTotalPercentual(percentualTotal);
    } catch (error) {
      console.error('Erro ao carregar estatísticas da sprint atual:', error);
      setQuestoesCorretas(0);
      setQuestoesErradas(0);
      setDadosDisciplinas([]);
      setTotalAcertos(0);
      setTotalQuestoes(0);
      setTotalPercentual(0);
    } finally {
      setLoading(false);
    }
  };

  // A ordem dos dados e das cores é importante: verde para acertos, vermelho para erros
  const dataPie = [
    { name: 'Acertos', value: questoesCorretas }, // Verde
    { name: 'Erros', value: questoesErradas }     // Vermelho
  ];
  const COLORS = ['#51d7a5', '#c6484d']; // [Verde, Vermelho]
  const COLORS_HOVER = ['#10f9a4', '#dc181f']; // Verde e vermelho para hover

  if (loading) {
    return <div className={styles.loading}>Carregando estatísticas...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Minhas Estatísticas</h1>
      <p className={styles.statsDescricao}>Acompanhe seu progresso com as principais métricas de desempenho e veja como sua preparação está evoluindo.</p>
      {/* Menu de abas */}
      <div className={styles.tabsMenu}>
        <button
          className={abaSelecionada === 0 ? styles.tabActive : styles.tab}
          onClick={() => setAbaSelecionada(0)}
        >
          Percentual de Rendimentos
        </button>
        <button
          className={abaSelecionada === 1 ? styles.tabActive : styles.tab}
          onClick={() => setAbaSelecionada(1)}
        >
          Desempenho por meta
        </button>
      </div>
      <div className={styles.tabsUnderline}></div>
      <div className={styles.graficoPizzaContainer + ' ' + styles.graficoTabelaGrid}>
        {abaSelecionada === 0 && (
          <>
            <div className={styles.graficoTabelaWrapper}>
              <div className={styles.graficoCol}>
                <h3>Percentual de rendimento{nomeSprintAtual && ` (${nomeSprintAtual})`}</h3>
                <div className={styles.graficoComResumo}>
                  <div className={styles.graficoPizzaBox}>
                    <div style={{ width: '100%', maxWidth: 300, height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%" tabIndex={-1}>
                        <PieChart>
                          <Pie
                            data={dataPie}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={2}
                            stroke="#181c23"
                            strokeWidth={3}
                            cornerRadius={4}
                            dataKey="value"
                            activeIndex={activeIndex}
                            activeShape={undefined}
                            onMouseEnter={(_, idx) => setActiveIndex(idx)}
                            onMouseLeave={() => setActiveIndex(null)}
                          >
                            {dataPie.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={activeIndex === index ? COLORS_HOVER[index % COLORS_HOVER.length] : COLORS[index % COLORS.length]}
                                style={{ transition: 'fill 3.0s' }}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip dataPie={dataPie} setShowValues={setShowValues} />} />
                          <Legend layout="horizontal" align="center" verticalAlign="bottom" iconType="rect"/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className={styles.statsFooterVertical}>
                    <div className={styles.statsFooterItem}>
                      <span className={styles.blueLine}></span>
                      <div className={styles.statsFooterContent}>
                        <span className={styles.statsFooterValue}>{questoesCorretas + questoesErradas}</span>
                        <span className={styles.statsFooterText}>Resoluções de Questões</span>
                      </div>
                    </div>
                    <div className={styles.statsFooterItem}>
                      <span className={styles.greenLine}></span>
                      <div className={styles.statsFooterContent}>
                        <span className={styles.statsFooterValue}>{questoesCorretas}</span>
                        <span className={styles.statsFooterText}>Resoluções Corretas</span>
                      </div>
                    </div>
                    <div className={styles.statsFooterItem}>
                      <span className={styles.redLine}></span>
                      <div className={styles.statsFooterContent}>
                        <span className={styles.statsFooterValue}>{questoesErradas}</span>
                        <span className={styles.statsFooterText}>Resoluções Erradas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.tabelaCol}>
                <table className={styles.tabelaDesempenho}>
                  <thead>
                    <tr>
                      <th>Disciplina</th>
                      <th>Acertos</th>
                      <th>Questões</th>
                      <th>% de acertos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosDisciplinas.map((disc, idx) => (
                      <tr key={disc.nome}>
                        <td>{disc.nome}</td>
                        <td>{disc.acertos}</td>
                        <td>{disc.questoes}</td>
                        <td>{disc.percentual.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className={styles.tabelaTotalRow}>
                      <td>TOTAL</td>
                      <td>{totalAcertos}</td>
                      <td>{totalQuestoes}</td>
                      <td>{totalPercentual}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
        {abaSelecionada === 1 && (
          <div style={{ color: '#fff', textAlign: 'center', marginTop: 40, fontSize: 20 }}>
            <p>Em breve: Desempenho por meta</p>
          </div>
        )}
      </div>
    </div>
  );
} 