import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Disciplinas.module.css';
import axios from '../../services/api';
import editIcon from '../../assets/icons/edit.svg';
import deleteIcon from '../../assets/icons/delete.svg';
import ImportarPlanilhaButton from '../../components/ImportarPlanilhaButton/ImportarPlanilhaButton';
import * as XLSX from 'xlsx';

export default function Disciplinas() {
  const navigate = useNavigate();
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDisciplina, setSelectedDisciplina] = useState(null);
  const [importedData, setImportedData] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchDisciplinas();
  }, []);

  // Fechar o modal ao pressionar ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) { // ESC key
        setModalVisible(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const fetchDisciplinas = async () => {
    try {
      setLoading(true);
      console.log('Buscando disciplinas...');
      const response = await axios.get('/disciplinas');
      console.log('Disciplinas recebidas:', response.data);
      setDisciplinas(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error);
      setError(error.message || 'Erro ao carregar disciplinas');
      setDisciplinas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCadastrarClick = () => {
    navigate('/disciplinas/cadastrar');
  };

  const handleEditClick = (id, e) => {
    // Evitar propagação do evento para não abrir o modal
    if (e) {
      e.stopPropagation();
    }
    navigate(`/disciplinas/editar/${id}`);
  };

  const handleDeleteClick = async (id, e) => {
    // Evitar propagação do evento para não abrir o modal
    if (e) {
      e.stopPropagation();
    }
    
    if (window.confirm('Tem certeza que deseja excluir esta disciplina?')) {
      try {
        await axios.delete(`/disciplinas/${id}`);
        alert('Disciplina excluída com sucesso!');
        fetchDisciplinas();
      } catch (error) {
        console.error('Erro ao excluir disciplina:', error);
        alert('Erro ao excluir disciplina. Tente novamente.');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleAssuntosClick = (disciplina) => {
    setSelectedDisciplina(disciplina);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedDisciplina(null);
  };

  const handleImportarPlanilha = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const [header, ...rows] = json;
      const result = rows.map(row => ({
        disciplina: row[0],
        assunto: row[1]
      }));
      setImportedData(result);
      setShowImportModal(true);
    };
    reader.readAsArrayBuffer(file);
  };

  // Destaca o termo de busca no texto
  const highlightMatch = (text, term) => {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="' + styles.highlight + '">$1</mark>');
  };

  // Filtra as disciplinas de acordo com o termo de busca e o filtro de status
  const filteredDisciplinas = disciplinas
    .filter(disciplina => {
      // Filtro por status
      if (statusFilter === 'ativos') return disciplina.ativa === true;
      if (statusFilter === 'inativos') return disciplina.ativa === false;
      return true; // statusFilter === 'todos'
    })
    .filter(disciplina => 
      disciplina.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Ordenar por status (ativos primeiro) e depois por nome
      if (a.ativa !== b.ativa) return b.ativa ? 1 : -1;
      return a.nome.localeCompare(b.nome);
    });

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className={styles.container}>
          <div className={styles.loading}>Carregando disciplinas...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className={styles.container}>
        <div className={styles.header} style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: 0 }}>
          <h1 className={styles.tituloPlanos}>Disciplinas</h1>
        </div>
        <div className={styles.tabsUnderline}></div>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer} style={{ marginRight: 24 }}>
            <input
              type="text"
              placeholder="Buscar disciplinas..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button 
                className={styles.clearSearch}
                onClick={() => setSearchTerm('')}
                title="Limpar busca"
              >
                ×
              </button>
            )}
          </div>
          <div className={styles.filterContainer} style={{ marginRight: 24 }}>
            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </div>
          <button 
            className={styles.addButton}
            onClick={handleCadastrarClick}
          >
            + Nova Disciplina
          </button>
          <ImportarPlanilhaButton onFileSelected={handleImportarPlanilha} />
        </div>
        {/* Modal de pré-visualização dos dados importados */}
        {showImportModal && importedData.length > 0 && (
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
              minWidth: 600,
              maxWidth: 900,
              width: '90%',
              color: '#e0e6ed',
              boxShadow: '0 4px 32px #000a',
              position: 'relative',
              maxHeight: '70vh',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <button
                onClick={() => setShowImportModal(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'none',
                  border: 'none',
                  color: '#e0e6ed',
                  fontSize: 24,
                  cursor: 'pointer',
                }}
                title="Fechar"
              >
                ×
              </button>
              <h3 style={{ color: '#e0e6ed', marginBottom: 16 }}>Pré-visualização da importação</h3>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 16, color: '#e0e6ed', marginBottom: 8, background: 'rgba(37,99,235,0.18)', borderRadius: 8, position: 'sticky', top: 0, zIndex: 1, padding: 8, paddingRight: 16 }}>
                  <div style={{ minWidth: 90, marginLeft: 12, marginRight: 8, background: '#2563eb', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 13, padding: '6px 16px', display: 'inline-block', textAlign: 'center' }}>
                    Disciplina
                  </div>
                  <div style={{ flex: 1, color: '#e0e6ed', fontSize: 15, padding: '8px 0', marginLeft: 16 }}>Assunto</div>
                </div>
                <div style={{ 
                  maxHeight: '45vh', 
                  overflowY: 'auto', 
                  padding: 8, 
                  border: '1px solid #fff', 
                  borderRadius: 8, 
                  boxSizing: 'border-box',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#666 transparent'
                }}>
                  {importedData.map((row, idx) => (
                    <div
                      key={idx}
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
                        minWidth: 90,
                        marginLeft: 12,
                        marginRight: 8,
                        background: '#2563eb',
                        color: '#fff',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 13,
                        padding: '6px 16px',
                        display: 'inline-block',
                        textAlign: 'center',
                      }}>
                        {row.disciplina}
                      </div>
                      <div style={{ flex: 1, color: '#e0e6ed', fontSize: 15, padding: '8px 0', marginLeft: 16 }}>{row.assunto}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchDisciplinas}>Tentar novamente</button>
          </div>
        )}

        {!error && disciplinas.length === 0 && (
          <div className={styles.emptyState}>
            <p>Nenhuma disciplina encontrada. Clique em "Nova Disciplina" para criar.</p>
          </div>
        )}

        {!error && disciplinas.length > 0 && filteredDisciplinas.length === 0 && (
          <div className={styles.emptyState}>
            <p>
              {searchTerm 
                ? `Nenhuma disciplina encontrada para "${searchTerm}"${statusFilter !== 'todos' ? ' com o filtro selecionado' : ''}.`
                : `Nenhuma disciplina ${statusFilter === 'ativos' ? 'ativa' : 'inativa'} encontrada.`
              }
            </p>
            <div className={styles.emptyStateActions}>
              {searchTerm && (
                <button 
                  className={styles.clearSearchButton}
                  onClick={() => setSearchTerm('')}
                >
                  Limpar busca
                </button>
              )}
              {statusFilter !== 'todos' && (
                <button 
                  className={styles.clearFilterButton}
                  onClick={() => setStatusFilter('todos')}
                >
                  Mostrar todas
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cards de disciplinas em grid de 3 colunas */}
        {!error && filteredDisciplinas.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 32 }}>
            {filteredDisciplinas.map((disciplina) => (
              <div key={disciplina.id} className={styles.disciplinaCard}>
                {/* Conteúdo do card da disciplina */}
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{disciplina.nome}</h2>
                  <span className={disciplina.ativa ? styles.statusAtivo : styles.statusInativo} style={{ minWidth: 90, marginLeft: 12, marginRight: 32 }}>
                    {disciplina.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className={styles.cardActions}>
                  <button onClick={(e) => handleEditClick(disciplina.id, e)} className={styles.editButton}>
                    <img src={editIcon} alt="Editar" />
                  </button>
                  <button onClick={(e) => handleDeleteClick(disciplina.id, e)} className={styles.deleteButton}>
                    <img src={deleteIcon} alt="Excluir" />
                  </button>
                  <button onClick={() => handleAssuntosClick(disciplina)} className={styles.assuntosButton}>
                    Assuntos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Assuntos */}
        {modalVisible && selectedDisciplina && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Assuntos - {selectedDisciplina.nome}</h3>
                <button 
                  className={styles.closeModalButton}
                  onClick={handleCloseModal}
                >
                  &times;
                </button>
              </div>
              <div className={styles.modalContent}>
                {selectedDisciplina.assuntos && selectedDisciplina.assuntos.length > 0 ? (
                  <ul className={styles.modalAssuntosList}>
                    {selectedDisciplina.assuntos.map((assunto, index) => (
                      <li key={index} className={styles.modalAssuntoItem}>
                        <span dangerouslySetInnerHTML={{ __html: highlightMatch(assunto.nome, searchTerm) }}></span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyModalAssuntos}>Nenhum assunto cadastrado para esta disciplina.</p>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.editModalButton}
                  onClick={() => {
                    handleCloseModal();
                    handleEditClick(selectedDisciplina.id);
                  }}
                >
                  <img src={editIcon} alt="Editar" />
                  <span>Editar Disciplina</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 