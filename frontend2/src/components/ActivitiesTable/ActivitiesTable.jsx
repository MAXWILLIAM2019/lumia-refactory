import { useState, useEffect } from 'react';
import styles from './ActivitiesTable.module.css';
import api from '../../services/api';

/**
 * Componente ActivitiesTable
 * Exibe uma tabela com as metas da sprint
 * 
 * @param {Object} props
 * @param {Array} props.activities - Lista de metas a serem exibidas
 * @param {Object} props.activities[].disciplina - Nome da disciplina
 * @param {string} props.activities[].tipo - Tipo da meta
 * @param {string} props.activities[].titulo - Título da meta
 * @param {string} props.activities[].relevancia - Nível de relevância (em estrelas)
 * @param {string} props.activities[].tempo - Tempo gasto
 * @param {string} props.activities[].desempenho - Nível de desempenho
 * @param {string} props.activities[].codigo - Código da meta
 * @param {Function} props.onRefresh - Função chamada quando os dados são atualizados
 */
export default function ActivitiesTable({ activities, onFilterChange, onRefresh }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [formData, setFormData] = useState({
    completed: false,
    horas: '00',
    minutos: '00',
    totalQuestoes: 0,
    questoesCorretas: 0
  });
  const [loading, setLoading] = useState(false);

  const filters = [
    { id: 'all', label: 'Metas', count: activities.length }
  ];

  // Aplicar filtro por tipo se não for "todos"
  const filteredActivities = tipoFilter === 'todos' 
    ? activities 
    : activities.filter(a => a.tipo === tipoFilter);

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    if (onFilterChange) {
      onFilterChange(filterId);
    }
  };

  const handleTipoFilter = (tipo) => {
    setTipoFilter(tipo);
    setShowDropdown(false);
  };

  const handleRowClick = (activity) => {
    setSelectedActivity(activity);
    
    // Separar horas e minutos
    let horas = '0';
    let minutos = '0';
    
    if (activity.tempo && activity.tempo !== '--:--') {
      const [h, m] = activity.tempo.split(':');
      // Remover zeros à esquerda para facilitar a edição
      horas = String(parseInt(h, 10));
      minutos = String(parseInt(m, 10));
    }
    
    setFormData({
      completed: activity.status === 'Concluída',
      horas,
      minutos,
      totalQuestoes: activity.totalQuestoes || 0,
      questoesCorretas: activity.questoesCorretas || 0
    });
    
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedActivity(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validação específica para horas e minutos
    if (name === 'horas' || name === 'minutos') {
      // Permitir entrada vazia para facilitar a edição
      if (value === '') {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        return;
      }
      
      // Garantir que apenas números são inseridos
      const numericValue = value.replace(/\D/g, '');
      
      // Validar intervalo (0-23 para horas, 0-59 para minutos)
      let validValue = numericValue;
      if (name === 'horas' && Number(numericValue) > 23) {
        validValue = '23';
      } else if (name === 'minutos' && Number(numericValue) > 59) {
        validValue = '59';
      }
      
      // Não preencher automaticamente com zeros para permitir edição
      setFormData(prev => ({
        ...prev,
        [name]: validValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validação na perda de foco para garantir limites corretos
  const handleTimeBlur = (e) => {
    const { name, value } = e.target;
    
    // Se o campo estiver vazio, definir como "0"
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: '0'
      }));
      return;
    }
    
    // Converter para número e validar limites
    const numValue = parseInt(value, 10);
    
    if (name === 'horas' && (isNaN(numValue) || numValue < 0)) {
      setFormData(prev => ({ ...prev, horas: '0' }));
    } else if (name === 'minutos' && (isNaN(numValue) || numValue < 0)) {
      setFormData(prev => ({ ...prev, minutos: '0' }));
    }
  };

  const handleToggleChange = () => {
    setFormData(prev => ({
      ...prev,
      completed: !prev.completed
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedActivity) return;
    
    try {
      setLoading(true);
      
      // Formatar horas e minutos com zeros à esquerda
      const horasFormatadas = String(formData.horas).padStart(2, '0');
      const minutosFormatados = String(formData.minutos).padStart(2, '0');
      
      // Formatar o tempo no formato HH:MM
      const tempoEstudado = `${horasFormatadas}:${minutosFormatados}`;
      
      // Calcular o desempenho baseado nas questões (se houver)
      let desempenho = 0;
      if (formData.totalQuestoes > 0 && formData.questoesCorretas > 0) {
        desempenho = Math.round((formData.questoesCorretas / formData.totalQuestoes) * 100);
      }
      
      // Preparar os dados para envio
      const updateData = {
        status: formData.completed ? 'Concluída' : 'Pendente',
        tempoEstudado,
        desempenho
      };
      
      // Adicionar dados de questões apenas se fornecidos
      if (formData.totalQuestoes > 0) {
        updateData.totalQuestoes = formData.totalQuestoes;
        updateData.questoesCorretas = formData.questoesCorretas;
      }
      
      // Enviar para o backend
      await api.put(`/metas/${selectedActivity.codigo}`, updateData);
      
      // Fechar o modal e atualizar os dados
      handleModalClose();
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      alert('Ocorreu um erro ao atualizar a meta. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Retorna uma porcentagem de acerto das questões
  const calcularPorcentagemAcerto = () => {
    if (formData.totalQuestoes > 0 && formData.questoesCorretas > 0) {
      return Math.round((formData.questoesCorretas / formData.totalQuestoes) * 100);
    }
    return 0;
  };

  return (
    <div className={styles.container}>
      {/* Abas de filtro de metas */}
      <div className={styles.tabs}>
        <div className={styles.tabsLeft}>
          {filters.map(filter => (
            <button 
              key={filter.id}
              className={styles.active}
              onClick={() => handleFilterClick(filter.id)}
            >
              {filter.label} | {filter.count}
            </button>
          ))}
        </div>
        
        <div className={styles.tabsRight}>
          <div className={styles.dropdown}>
            <button 
              className={styles.dropdownButton}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              Filtrar por: {tipoFilter === 'todos' ? 'Todos' : 
                tipoFilter === 'teoria' ? 'Teoria' : 
                tipoFilter === 'questoes' ? 'Questões' : 
                tipoFilter === 'revisao' ? 'Revisão' : 'Reforço'}
            </button>
            
            {showDropdown && (
              <div className={styles.dropdownContent}>
                <button onClick={() => handleTipoFilter('todos')}>Todos</button>
                <button onClick={() => handleTipoFilter('teoria')}>Teoria</button>
                <button onClick={() => handleTipoFilter('questoes')}>Questões</button>
                <button onClick={() => handleTipoFilter('revisao')}>Revisão</button>
                <button onClick={() => handleTipoFilter('reforco')}>Reforço</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de metas */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Disciplina</th>
            <th>Tipo</th>
            <th>Título</th>
            <th>Comando</th>
            <th>Relevância</th>
            <th>Tempo</th>
            <th>Desempenho</th>
            <th>Link</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredActivities.map((a, i) => (
            <tr key={a.codigo} className={styles.activityRow} onClick={() => handleRowClick(a)}>
              <td>{i + 1}</td>
              <td>{a.disciplina}</td>
              <td>{a.tipo}</td>
              <td>{a.titulo}</td>
              <td>
                <div className={styles.comandoCell} dangerouslySetInnerHTML={{ __html: a.comando }} />
              </td>
              <td>{a.relevancia}</td>
              <td>{a.tempo}</td>
              <td>{a.desempenho}</td>
              <td>
                {a.link ? (
                  <a 
                    href={a.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.linkCell}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visualizar
                  </a>
                ) : '-'}
              </td>
              <td>
                <span className={`${styles.status} ${styles[a.status.toLowerCase()]}`}>
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de Edição */}
      {showModal && selectedActivity && (
        <div className={styles.modalOverlay} onClick={handleModalClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Atualizar Meta</h3>
              <button className={styles.closeButton} onClick={handleModalClose}>
                &times;
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <h4>{selectedActivity.titulo}</h4>
              <p><strong>Disciplina:</strong> {selectedActivity.disciplina}</p>
              <p><strong>Tipo:</strong> {selectedActivity.tipo}</p>
              
              <form onSubmit={handleSubmit}>
                <div className={styles.toggleContainer}>
                  <label htmlFor="toggleCompleted">Concluir meta</label>
                  <div className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      id="toggleCompleted"
                      checked={formData.completed}
                      onChange={handleToggleChange}
                      className={styles.toggleCheckbox}
                    />
                    <label className={styles.toggleLabel} htmlFor="toggleCompleted">
                      <span className={styles.toggleButton}></span>
                    </label>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Tempo de Estudo</label>
                  <div className={styles.timeInputContainer}>
                    <div className={styles.timeInputGroup}>
                      <input 
                        type="text" 
                        name="horas" 
                        value={formData.horas}
                        onChange={handleInputChange}
                        onBlur={handleTimeBlur}
                        className={styles.timeInput}
                        maxLength="2"
                        required
                      />
                      <span className={styles.timeLabel}>horas</span>
                    </div>
                    <span className={styles.timeSeparator}>:</span>
                    <div className={styles.timeInputGroup}>
                      <input 
                        type="text" 
                        name="minutos" 
                        value={formData.minutos}
                        onChange={handleInputChange}
                        onBlur={handleTimeBlur}
                        className={styles.timeInput}
                        maxLength="2"
                        required
                      />
                      <span className={styles.timeLabel}>minutos</span>
                    </div>
                  </div>
                </div>
                
                {/* Campos de questões - agora disponíveis para todos os tipos de meta */}
                <div className={styles.questionsContainer}>
                  <label>Questões</label>
                  
                  <div className={styles.questionsInputContainer}>
                    <div className={styles.questionsInputGroup}>
                      <label>Total</label>
                      <input 
                        type="number" 
                        name="totalQuestoes" 
                        value={formData.totalQuestoes}
                        onChange={handleInputChange}
                        min="0"
                        className={styles.questionInput}
                      />
                    </div>
                    
                    <div className={styles.questionsInputGroup}>
                      <label>Corretas</label>
                      <input 
                        type="number" 
                        name="questoesCorretas" 
                        value={formData.questoesCorretas}
                        onChange={handleInputChange}
                        min="0"
                        max={formData.totalQuestoes}
                        className={styles.questionInput}
                      />
                    </div>
                    
                    <div className={styles.questionResultGroup}>
                      <div className={styles.questionResultLabel}>Acertos</div>
                      <div className={styles.questionResultValue}>
                        {calcularPorcentagemAcerto()}%
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.formActions}>
                  <button 
                    type="submit" 
                    className={styles.saveButton}
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button 
                    type="button" 
                    className={styles.cancelButton} 
                    onClick={handleModalClose}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 