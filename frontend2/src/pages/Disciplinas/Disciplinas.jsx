import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Disciplinas.module.css';
import axios from '../../services/api';
import editIcon from '../../assets/icons/edit.svg';
import deleteIcon from '../../assets/icons/delete.svg';

export default function Disciplinas() {
  const navigate = useNavigate();
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDisciplina, setSelectedDisciplina] = useState(null);

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
      <div className={styles.container}>
        <div className={styles.loading}>Carregando disciplinas...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Disciplinas</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
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
          
          <div className={styles.filterContainer}>
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
        </div>
      </div>

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

      <div className={styles.disciplinasList}>
        {filteredDisciplinas.map((disciplina) => (
          <div key={disciplina.id} className={styles.disciplinaCard}>
            <div className={styles.disciplinaHeader}>
              <h2 dangerouslySetInnerHTML={{ __html: highlightMatch(disciplina.nome, searchTerm) }}></h2>
              <div className={styles.disciplinaActions}>
                <button
                  className={styles.editButton}
                  onClick={(e) => handleEditClick(disciplina.id, e)}
                  title="Editar disciplina"
                >
                  <img src={editIcon} alt="Editar" />
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={(e) => handleDeleteClick(disciplina.id, e)}
                  title="Excluir disciplina"
                >
                  <img src={deleteIcon} alt="Excluir" />
                </button>
              </div>
            </div>
            
            <div className={styles.statusBadge + ' ' + (disciplina.ativa ? styles.statusAtiva : styles.statusInativa)}>
              {disciplina.ativa ? 'Ativa' : 'Inativa'}
            </div>
            
            <div 
              className={styles.assuntosContainer}
              onClick={() => handleAssuntosClick(disciplina)}
            >
              <h3>Assuntos</h3>
              {disciplina.assuntos && disciplina.assuntos.length > 0 ? (
                <>
                  <ul className={styles.assuntosList}>
                    {disciplina.assuntos.map((assunto, index) => (
                      <li key={index} className={styles.assuntoItem}
                        dangerouslySetInnerHTML={{ __html: highlightMatch(assunto.nome, searchTerm) }}>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.fadeOverlay}>
                    <span className={styles.expandText}>Ver todos</span>
                  </div>
                </>
              ) : (
                <p className={styles.emptyAssuntos}>Nenhum assunto cadastrado</p>
              )}
            </div>
          </div>
        ))}
      </div>

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
  );
} 