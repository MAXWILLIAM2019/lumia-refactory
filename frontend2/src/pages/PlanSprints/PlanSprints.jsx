import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../RegisterPlan/RegisterPlan.module.css';
import { sprintService } from '../../services/sprintService';
import { planoService } from '../../services/planoService';
import addSprintIcon from '../../assets/icons/add-sprint.svg';
import registerSprintIcon from '../../assets/icons/register-sprint.svg';
import editDisciplineIcon from '../../assets/icons/edit-discipline.svg';
import deletePlanIcon from '../../assets/icons/delete-plan.svg';
import * as XLSX from 'xlsx';

const StarRating = ({ rating }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={star <= rating ? '#f59e0b' : 'none'}
          stroke={star <= rating ? '#f59e0b' : '#6b7280'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

export default function PlanSprints() {
  const { id } = useParams();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [planoNome, setPlanoNome] = useState('');
  const navigate = useNavigate();
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Estados para importação
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedMetas, setImportedMetas] = useState([]);
  const [importMetasError, setImportMetasError] = useState(null);
  const [importando, setImportando] = useState(false);

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        setLoading(true);
        const data = await sprintService.listarSprintsPorPlano(id);
        console.log('Dados das sprints:', data);
        setSprints(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        console.error('Erro ao carregar sprints:', err);
        setError('Erro ao carregar sprints do plano.');
        setSprints([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSprints();
  }, [id]);

  useEffect(() => {
    const fetchPlano = async () => {
      try {
        const plano = await planoService.buscarPlanoPorId(id);
        setPlanoNome(plano?.nome || '');
      } catch {
        setPlanoNome('');
      }
    };
    fetchPlano();
  }, [id]);

  const handleVisualizar = (sprint) => {
    setSelectedSprint(sprint);
    setShowModal(true);
  };

  const handleEditar = (sprintId) => {
    navigate(`/sprints/editar/${sprintId}`);
  };

  const handleExcluir = async (sprintId) => {
    if (window.confirm('Tem certeza que deseja excluir esta sprint?')) {
      try {
        await sprintService.excluirSprint(sprintId);
        setSprints(sprints.filter(sprint => sprint.id !== sprintId));
      } catch (error) {
        setError('Erro ao excluir sprint. Tente novamente.');
      }
    }
  };

  const handleImportarMetas = async (file) => {
    try {
      setImportando(true);
      setImportMetasError(null);
      setImportedMetas([]);

      // Primeiro, vamos buscar as metas existentes da sprint selecionada
      const sprint = await sprintService.buscarSprintPorId(selectedSprint.id);
      const metasExistentes = sprint.metas || [];
      const posicoesExistentes = new Set(metasExistentes.map(meta => meta.posicao));

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const [header, ...rows] = json;

        // Esperado: disciplina, tipo, titulo, comandos, link, relevancia, meta
        const colunasEsperadas = ['disciplina', 'tipo', 'titulo', 'comandos', 'link', 'relevancia', 'meta'];
        const headerLower = header.map(h => (h || '').toString().toLowerCase().trim());
        const indices = colunasEsperadas.map(col => headerLower.indexOf(col));

        // Validação de header
        if (indices.some(idx => idx === -1)) {
          setImportMetasError({
            titulo: 'Erro na importação',
            mensagens: ['A planilha deve conter as colunas: disciplina, tipo, titulo, comandos, link, relevancia, meta']
          });
          return;
        }

        // Coletar todas as posições da planilha
        const posicoesNaPlanilha = rows.map(row => parseInt(row[indices[6]]?.toString().trim()));
        const posicoesUnicas = new Set(posicoesNaPlanilha.filter(p => !isNaN(p)));

        // Verificar posições repetidas na planilha
        if (posicoesNaPlanilha.length !== posicoesUnicas.size) {
          const posicoesRepetidas = posicoesNaPlanilha.filter(
            (posicao, index) => posicoesNaPlanilha.indexOf(posicao) !== index
          );
          setImportMetasError({
            titulo: 'Erro na importação',
            mensagens: [`Existem posições repetidas na planilha: ${posicoesRepetidas.join(', ')}. Cada meta deve ter uma posição única.`]
          });
          return;
        }

        // Validação de linhas
        const linhasComErro = rows.map((row, index) => {
          const disciplina = row[indices[0]];
          const tipo = row[indices[1]];
          const titulo = row[indices[2]];
          const relevancia = row[indices[5]];
          const meta = row[indices[6]];
          const tiposValidos = ['teoria', 'questoes', 'revisao', 'reforco'];
          
          if (!disciplina || !tipo || !titulo || !relevancia || !meta) {
            return {
              linha: index + 2,
              motivo: [
                !disciplina ? 'Disciplina não preenchida' : '',
                !tipo ? 'Tipo não preenchido' : '',
                !titulo ? 'Título não preenchido' : '',
                !relevancia ? 'Relevância não preenchida' : '',
                !meta ? 'Meta (posição) não preenchida' : ''
              ].filter(Boolean).join(', ')
            };
          }

          // Validar se meta é um número inteiro positivo
          const metaNum = parseInt(meta);
          if (isNaN(metaNum) || metaNum <= 0 || metaNum !== parseFloat(meta)) {
            return {
              linha: index + 2,
              motivo: 'Meta (posição) deve ser um número inteiro positivo maior que zero'
            };
          }

          // Validar se a posição já existe na sprint
          if (posicoesExistentes.has(metaNum)) {
            return {
              linha: index + 2,
              motivo: `A meta ${metaNum} já existe nesta sprint. Cada meta deve ter uma posição única.`
            };
          }

          if (!tiposValidos.includes(tipo.toLowerCase())) {
            return {
              linha: index + 2,
              motivo: `Tipo inválido. Valores aceitos: ${tiposValidos.join(', ')}`
            };
          }
          return null;
        }).filter(Boolean);

        if (linhasComErro.length > 0) {
          setImportMetasError({
            titulo: 'Erro na importação',
            mensagens: linhasComErro.map(erro => `Linha ${erro.linha}: ${erro.motivo}`)
          });
          return;
        }

        // Montar os dados importados
        const result = rows.map(row => ({
          disciplina: row[indices[0]]?.toString().trim() || '',
          tipo: row[indices[1]]?.toString().trim() || '',
          titulo: row[indices[2]]?.toString().trim() || '',
          comandos: row[indices[3]]?.toString().trim() || '',
          link: row[indices[4]]?.toString().trim() || '',
          relevancia: row[indices[5]]?.toString().trim() || '',
          posicao: parseInt(row[indices[6]]?.toString().trim()) || 0
        }));
        setImportedMetas(result);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erro ao importar metas:', error);
      setImportMetasError({
        titulo: 'Erro ao importar metas',
        mensagens: [error.message || 'Ocorreu um erro ao processar o arquivo.']
      });
    } finally {
      setImportando(false);
    }
  };

  const NovoSprintCard = (
    <div className={styles.novoPlanoCard} onClick={() => navigate(`/sprints/cadastrar/${id}`)}>
      <div className={styles.novoPlanoIcon}>
        <img src={addSprintIcon} alt="Criar Nova Sprint" width={32} height={32} />
      </div>
      <div>
        <h2>Criar Nova Sprint</h2>
      </div>
    </div>
  );

  const SprintCard = (sprint) => {
    console.log('Dados da sprint:', sprint);
    return (
      <div className={styles.planoCard} key={sprint.id}>
        <div className={styles.planoCardHeader}>
          <div className={styles.planoCardLogo}></div>
          <div>
            <h2 className={styles.planoCardTitle}>{sprint.nome}</h2>
            <p className={styles.planoCardDescription} style={{ color: '#666' }}>
              Metas: {sprint.metas ? sprint.metas.length : 0}
            </p>
          </div>
        </div>
        <div className={styles.planoCardActions}>
          <button 
            className={styles.actionButton}
            onClick={() => handleVisualizar(sprint)}
          >
            <img src={addSprintIcon} alt="Visualizar" width={24} height={24} style={{ marginRight: '8px' }} />
            <span>Visualizar</span>
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => handleEditar(sprint.id)}
          >
            <img src={editDisciplineIcon} alt="Editar" width={24} height={24} style={{ marginRight: '8px' }} />
            <span>Editar</span>
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => handleExcluir(sprint.id)}
          >
            <img src={deletePlanIcon} alt="Excluir" width={24} height={24} style={{ marginRight: '8px' }} />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    );
  };

  /**
   * Modal para visualização detalhada das metas de uma sprint
   * Características:
   * - Exibe todas as metas da sprint em uma tabela
   * - Mostra a posição original de cada meta (número da meta)
   * - Permite visualizar o conteúdo dos comandos em um modal secundário
   * - Links clicáveis para recursos externos
   * - Estilização consistente com o tema escuro da aplicação
   */
  const MetasModal = () => {
    if (!selectedSprint) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(24,28,35,0.92)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: '#181c23',
          borderRadius: 16,
          padding: 24,
          minWidth: 900,
          maxWidth: 1200,
          width: '95%',
          color: '#e0e6ed',
          boxShadow: '0 4px 32px #000a',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <h3 style={{ color: '#e0e6ed', marginBottom: 16 }}>{selectedSprint.nome}</h3>
          <div style={{ width: '100%' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontWeight: 600, 
              fontSize: 16, 
              color: '#e0e6ed', 
              marginBottom: 8, 
              background: 'rgba(37,99,235,0.18)', 
              borderRadius: 8, 
              position: 'sticky', 
              top: 0, 
              zIndex: 1, 
              padding: 8, 
              paddingRight: 16 
            }}>
              <div style={{ 
                width: '80px', 
                minWidth: '80px',
                maxWidth: '80px',
                marginLeft: 12, 
                marginRight: 8, 
                background: '#2563eb', 
                color: '#fff', 
                borderRadius: 8, 
                fontWeight: 700, 
                fontSize: 16, 
                padding: '6px 16px', 
                textAlign: 'center' 
              }}>
                Meta
              </div>
              <div style={{ 
                flex: 1, 
                minWidth: 120, 
                maxWidth: 180, 
                marginRight: 8, 
                background: '#2563eb', 
                color: '#fff', 
                borderRadius: 8, 
                fontWeight: 700, 
                fontSize: 16, 
                padding: '6px 16px', 
                textAlign: 'left' 
              }}>
                Disciplina
              </div>
              <div style={{ 
                flex: 1, 
                minWidth: 100, 
                maxWidth: 140, 
                marginRight: 8, 
                background: '#2563eb', 
                color: '#fff', 
                borderRadius: 8, 
                fontWeight: 700, 
                fontSize: 16, 
                padding: '6px 16px', 
                textAlign: 'left' 
              }}>
                Tipo
              </div>
              <div style={{ 
                flex: 2, 
                minWidth: 180, 
                marginRight: 8, 
                background: '#2563eb', 
                color: '#fff', 
                borderRadius: 8, 
                fontWeight: 700, 
                fontSize: 16, 
                padding: '6px 16px', 
                textAlign: 'left' 
              }}>
                Título
              </div>
              <div style={{ 
                flex: 2, 
                minWidth: 180, 
                marginRight: 8, 
                background: '#2563eb', 
                color: '#fff', 
                borderRadius: 8, 
                fontWeight: 700, 
                fontSize: 16, 
                padding: '6px 16px', 
                textAlign: 'left' 
              }}>
                Comandos
              </div>
              <div style={{ 
                flex: 1, 
                minWidth: 110, 
                maxWidth: 140, 
                marginRight: 8, 
                background: '#2563eb', 
                color: '#fff', 
                borderRadius: 8, 
                fontWeight: 700, 
                fontSize: 16, 
                padding: '6px 16px', 
                textAlign: 'center' 
              }}>
                Relevância
              </div>
            </div>
            <div style={{ 
              maxHeight: '55vh', 
              overflowY: 'auto', 
              padding: 8, 
              border: '1px solid #fff', 
              borderRadius: 8, 
              boxSizing: 'border-box',
              scrollbarWidth: 'thin',
              scrollbarColor: '#666 transparent'
            }}>
              {selectedSprint.metas && selectedSprint.metas.length > 0 ? (
                selectedSprint.metas.map((meta, idx) => (
                  <div
                    key={meta.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: idx % 2 === 0 ? '#23283a' : '#181c23',
                      borderRadius: 8,
                      marginBottom: 8,
                      boxShadow: '0 1px 4px #0002',
                      minHeight: 44,
                    }}
                  >
                    <div style={{ 
                      width: '80px', 
                      minWidth: '80px',
                      maxWidth: '80px',
                      color: '#f59e0b', 
                      borderRadius: 8, 
                      fontWeight: 700, 
                      fontSize: 15, 
                      padding: '6px 4px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      textAlign: 'center', 
                      background: 'rgba(245,158,11,0.12)', 
                      marginRight: 12, 
                      marginLeft: 12, 
                      borderRight: '4px solid #181c23' 
                    }}>{`Meta ${meta.posicao}`}</div>
                    <div style={{ 
                      minWidth: 120, 
                      maxWidth: 180, 
                      marginRight: 8, 
                      color: '#e0e6ed', 
                      borderRadius: 8, 
                      fontWeight: 600, 
                      fontSize: 15, 
                      padding: '6px 16px', 
                      display: 'inline-block', 
                      textAlign: 'left', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {meta.disciplina}
                    </div>
                    <div style={{ 
                      minWidth: 100, 
                      maxWidth: 140, 
                      marginRight: 8, 
                      color: '#e0e6ed', 
                      borderRadius: 8, 
                      fontWeight: 600, 
                      fontSize: 15, 
                      padding: '6px 16px', 
                      display: 'inline-block', 
                      textAlign: 'left', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {meta.tipo}
                    </div>
                    <div style={{ 
                      flex: 2, 
                      minWidth: 180, 
                      color: '#e0e6ed', 
                      fontSize: 15, 
                      padding: '8px 0', 
                      marginLeft: 16, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {meta.titulo}
                    </div>
                    <div style={{ 
                      flex: 2, 
                      minWidth: 180, 
                      color: '#e0e6ed', 
                      fontSize: 15, 
                      padding: '8px 0', 
                      marginLeft: 16, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {meta.comandos}
                    </div>
                    <div style={{ 
                      minWidth: 110, 
                      maxWidth: 140, 
                      marginRight: 8, 
                      color: '#e0e6ed', 
                      borderRadius: 8, 
                      fontWeight: 600, 
                      fontSize: 18, 
                      padding: '6px 16px', 
                      display: 'inline-block', 
                      textAlign: 'center', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      <StarRating rating={Number(meta.relevancia)} />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#e0e6ed' }}>
                  Nenhuma meta encontrada para esta sprint.
                </div>
              )}
            </div>
          </div>
          <div style={{ 
            marginTop: 24,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12
          }}>
            <button
              onClick={() => {
                setShowImportModal(true);
                setShowModal(false);
              }}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '8px 24px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Adicionar
            </button>
            <button
              onClick={() => setShowModal(false)}
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '8px 24px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ImportMetasModal = () => {
    if (!selectedSprint) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(24,28,35,0.92)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: '#181c23',
          borderRadius: 16,
          padding: 24,
          minWidth: 900,
          maxWidth: 1200,
          width: '95%',
          color: '#e0e6ed',
          boxShadow: '0 4px 32px #000a',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <h3 style={{ color: '#e0e6ed', marginBottom: 16 }}>Importar Metas para {selectedSprint.nome}</h3>
          
          <div style={{ 
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
          }}>
            <div style={{
              width: '100%'
            }}>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImportarMetas(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
                style={{
                  background: '#2c3448',
                  border: '2px dashed #3b82f6',
                  borderRadius: 8,
                  padding: 16,
                  width: '100%',
                  color: '#e0e6ed',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {importando && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              color: '#e0e6ed' 
            }}>
              Processando arquivo...
            </div>
          )}

          {importMetasError && (
            <div style={{
              background: '#2c1f1f',
              border: '1px solid #dc2626',
              borderRadius: 8,
              padding: 16,
              marginBottom: 24
            }}>
              <h4 style={{ color: '#dc2626', marginBottom: 8 }}>{importMetasError.titulo}</h4>
              <ul style={{ 
                margin: 0,
                padding: '0 0 0 20px',
                color: '#fecaca'
              }}>
                {importMetasError.mensagens.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {importedMetas.length > 0 && (
            <div style={{
              marginTop: 24,
              marginBottom: 24
            }}>
              <h4 style={{ marginBottom: 16, color: '#e0e6ed' }}>Metas Importadas</h4>
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                background: '#2c3448',
                borderRadius: 8,
                padding: 16
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #4b5563' }}>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#9ca3af' }}>Posição</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#9ca3af' }}>Disciplina</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#9ca3af' }}>Tipo</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#9ca3af' }}>Título</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#9ca3af' }}>Comandos</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#9ca3af' }}>Link</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#9ca3af' }}>Relevância</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedMetas.map((meta, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #374151' }}>
                        <td style={{ padding: '8px', color: '#e0e6ed' }}>{meta.posicao}</td>
                        <td style={{ padding: '8px', color: '#e0e6ed' }}>{meta.disciplina}</td>
                        <td style={{ padding: '8px', color: '#e0e6ed' }}>{meta.tipo}</td>
                        <td style={{ padding: '8px', color: '#e0e6ed' }}>{meta.titulo}</td>
                        <td style={{ padding: '8px', color: '#e0e6ed', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {meta.comandos || '-'}
                        </td>
                        <td style={{ padding: '8px', color: '#e0e6ed', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {meta.link ? (
                            <a href={meta.link} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                              {meta.link}
                            </a>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '8px', color: '#e0e6ed' }}>
                          <StarRating rating={Number(meta.relevancia)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: 24,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12
          }}>
            <button
              onClick={async () => {
                try {
                  // Aqui vamos implementar a chamada à API para salvar as metas
                  const metasFormatadas = importedMetas.map(meta => ({
                    disciplina: meta.disciplina,
                    tipo: meta.tipo,
                    titulo: meta.titulo,
                    comandos: meta.comandos || '',
                    link: meta.link || '',
                    relevancia: Number(meta.relevancia) || 1,
                    posicao: meta.posicao
                  }));

                  await sprintService.adicionarMetas(selectedSprint.id, metasFormatadas);
                  
                  // Atualizar a lista de sprints
                  const data = await sprintService.listarSprintsPorPlano(id);
                  setSprints(Array.isArray(data) ? data : []);
                  
                  setShowImportModal(false);
                  setImportedMetas([]);
                  setImportMetasError(null);
                  
                  alert('Metas importadas com sucesso!');
                } catch (error) {
                  console.error('Erro ao salvar metas:', error);
                  setImportMetasError({
                    titulo: 'Erro ao salvar metas',
                    mensagens: [error.message || 'Ocorreu um erro ao salvar as metas.']
                  });
                }
              }}
              disabled={importando || importedMetas.length === 0}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '8px 24px',
                borderRadius: 8,
                cursor: importando || importedMetas.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 14,
                opacity: importando || importedMetas.length === 0 ? 0.7 : 1
              }}
            >
              Salvar novas metas
            </button>
            <button
              onClick={() => {
                setShowImportModal(false);
                setImportedMetas([]);
                setImportMetasError(null);
              }}
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '8px 24px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h1>{planoNome ? `${planoNome} → Sprints` : 'Sprints'}</h1>
      <div className={styles.tabsUnderline}></div>
      {error && <div className={styles.error}>{error}</div>}
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className={styles.cardsGrid}>
          {[NovoSprintCard, ...sprints.map(SprintCard)]}
        </div>
      )}
      {showModal && <MetasModal />}
      {showImportModal && <ImportMetasModal />}
    </div>
  );
} 