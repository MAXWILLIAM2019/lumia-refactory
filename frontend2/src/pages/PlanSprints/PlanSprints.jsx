import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../RegisterPlan/RegisterPlan.module.css';
import { sprintService } from '../../services/sprintService';
import { planoService } from '../../services/planoService';
import addSprintIcon from '../../assets/icons/add-sprint.svg';
import registerSprintIcon from '../../assets/icons/register-sprint.svg';
import editDisciplineIcon from '../../assets/icons/edit-discipline.svg';
import deletePlanIcon from '../../assets/icons/delete-plan.svg';

export default function PlanSprints() {
  const { id } = useParams();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [planoNome, setPlanoNome] = useState('');
  const navigate = useNavigate();
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <div className={styles.starsContainer} style={{ gap: 2, marginTop: 0 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`${styles.starButton} ${meta.relevancia >= star ? styles.active : ''}`}
                              style={{ cursor: 'default', fontSize: 18, padding: 0, transition: 'none', color: meta.relevancia >= star ? '#f59e0b' : '#4b5563' }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
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
    </div>
  );
} 