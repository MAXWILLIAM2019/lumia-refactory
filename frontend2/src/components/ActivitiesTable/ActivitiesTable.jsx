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
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [formData, setFormData] = useState({
    completed: false,
    horas: '00',
    minutos: '00',
    totalQuestoes: 0,
    questoesCorretas: 0
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Efeito para fechar o tooltip ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Se há um tooltip ativo e o clique não foi em um elemento com classe tooltip
      if (activeTooltip && !event.target.closest('.tooltipContainer')) {
        setActiveTooltip(null);
      }
    };

    // Adiciona o event listener
    document.addEventListener('click', handleClickOutside);

    // Cleanup: remove o event listener
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeTooltip]);

  const filters = [
    { id: 'all', label: 'Metas', count: activities.length }
  ];

  // Função para limitar o tamanho do texto do comando
  const limitarTextoComando = (comando) => {
    if (!comando) return '';
    
    // Remove as tags HTML para contar apenas o texto
    const textoSemHtml = comando.replace(/<[^>]*>?/gm, '');
    
    if (textoSemHtml.length <= 20) {
      return comando;
    }
    
    // Retorna os primeiros 20 caracteres + "..."
    return textoSemHtml.substring(0, 20) + '...';
  };

  // Função para manipular a exibição do tooltip
  const handleTooltipClick = (e, codigo) => {
    e.stopPropagation(); // Evitar que o clique propague para a linha da tabela

    // Se já está ativo, desativa; se não, ativa
    if (activeTooltip === codigo) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(codigo);
    }
  };

  // Aplicar filtro por tipo e termo de busca, mantendo a ordem original
  const filteredActivities = activities
    .filter(a => tipoFilter === 'todos' || a.tipo === tipoFilter)
    .filter(a => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        a.titulo.toLowerCase().includes(term) ||
        a.disciplina.toLowerCase().includes(term) ||
        (a.comando && a.comando.toLowerCase().includes(term))
      );
    });

  // Garantir que a ordem original seja mantida
  const sortedActivities = [...filteredActivities].sort((a, b) => a.codigo - b.codigo);

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRowClick = (activity) => {
    setSelectedActivity(activity);
    
    // Extrair horas e minutos do formato HHhMMm
    let horas = '0';
    let minutos = '0';
    
    if (activity.tempo && activity.tempo !== '--:--') {
      // Verificar se está no novo formato HHhMMm
      if (activity.tempo.includes('h') && activity.tempo.includes('m')) {
        const partes = activity.tempo.split(/h|m/);
        horas = String(parseInt(partes[0], 10));
        minutos = String(parseInt(partes[1], 10));
      } else {
        // Formato anterior HH:MM
        const [h, m] = activity.tempo.split(':');
        horas = String(parseInt(h, 10));
        minutos = String(parseInt(m, 10));
      }
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
    setErrorMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Limpar mensagem de erro quando o usuário altera o tempo
    if (name === 'horas' || name === 'minutos') {
      setErrorMessage('');
    }
    
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
    
    // Limpar mensagem de erro quando o usuário altera o toggle
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedActivity) return;
    
    // Validação: Se estiver marcado como concluído e o tempo for zero, mostrar erro
    const tempoTotal = parseInt(formData.horas, 10) * 60 + parseInt(formData.minutos, 10);
    if (formData.completed && tempoTotal === 0) {
      setErrorMessage('Não é possível marcar como concluída sem definir o tempo estudado.');
      return;
    }
    
    // Limpar mensagem de erro se passou pela validação
    setErrorMessage('');
    
    try {
      setLoading(true);
      
      // Formatar horas e minutos com zeros à esquerda
      const horasFormatadas = String(formData.horas).padStart(2, '0');
      const minutosFormatados = String(formData.minutos).padStart(2, '0');
      
      // Formatar o tempo no formato HH:MM para o backend
      const tempoEstudado = `${horasFormatadas}:${minutosFormatados}`;
      
      // Calcular o desempenho baseado nas questões (se houver)
      let desempenho = null;
      if (formData.totalQuestoes > 0 && formData.questoesCorretas > 0) {
        // Calcular o desempenho como número decimal (ex: 16.67)
        desempenho = (formData.questoesCorretas / formData.totalQuestoes) * 100;
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
      await api.put(`/sprints/metas/${selectedActivity.codigo}`, updateData);
      
      // Fechar o modal e atualizar os dados
      handleModalClose();
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      setErrorMessage('Ocorreu um erro ao atualizar a meta. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Retorna uma porcentagem de acerto das questões com duas casas decimais
  const calcularPorcentagemAcerto = () => {
    if (formData.totalQuestoes > 0 && formData.questoesCorretas > 0) {
      const porcentagem = (formData.questoesCorretas / formData.totalQuestoes) * 100;
      return porcentagem.toFixed(2).replace('.', ',');
    }
    return "0,00";
  };

  // Funções para incrementar e decrementar os valores de tempo
  const handleTimeIncrement = (field) => {
    if (field === 'horas') {
      const currentHours = parseInt(formData.horas, 10) || 0;
      const newHours = currentHours >= 23 ? 23 : currentHours + 1;
      setFormData(prev => ({ ...prev, horas: String(newHours) }));
    } else if (field === 'minutos') {
      const currentMinutes = parseInt(formData.minutos, 10) || 0;
      const newMinutes = currentMinutes >= 59 ? 59 : currentMinutes + 1;
      setFormData(prev => ({ ...prev, minutos: String(newMinutes) }));
    }
    
    // Limpar mensagem de erro quando o usuário altera o tempo
    setErrorMessage('');
  };

  const handleTimeDecrement = (field) => {
    if (field === 'horas') {
      const currentHours = parseInt(formData.horas, 10) || 0;
      const newHours = currentHours <= 0 ? 0 : currentHours - 1;
      setFormData(prev => ({ ...prev, horas: String(newHours) }));
    } else if (field === 'minutos') {
      const currentMinutes = parseInt(formData.minutos, 10) || 0;
      const newMinutes = currentMinutes <= 0 ? 0 : currentMinutes - 1;
      setFormData(prev => ({ ...prev, minutos: String(newMinutes) }));
    }
    
    // Limpar mensagem de erro quando o usuário altera o tempo
    setErrorMessage('');
  };

  // Componente para renderizar as estrelas de relevância
  const RelevanciaStars = ({ relevancia }) => {
    // Se estiver no formato antigo (string), retornar como está
    if (typeof relevancia === 'string') return relevancia;
    
    // Se não tiver o formato esperado, retornar traço
    if (!relevancia || !relevancia.hasOwnProperty('total') || !relevancia.hasOwnProperty('preenchidas')) {
      return '-';
    }
    
    const { total, preenchidas } = relevancia;
    
    const stars = [];
    for (let i = 0; i < total; i++) {
      stars.push(
        <span 
          key={i} 
          className={i < preenchidas ? styles.starFilled : styles.starEmpty}
        >
          ★
        </span>
      );
    }
    
    return <div className={styles.starsContainer}>{stars}</div>;
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
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Pesquisar metas..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>
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
          {sortedActivities.map((a, i) => (
            <tr key={a.codigo} className={styles.activityRow} onClick={() => handleRowClick(a)}>
              <td>{i + 1}</td>
              <td>{a.disciplina}</td>
              <td>{a.tipo}</td>
              <td>{a.titulo}</td>
              <td>
                <div 
                  className={`${styles.tooltipContainer} ${activeTooltip === a.codigo ? styles.tooltipActive : ''}`}
                >
                  <div 
                    className={styles.comandoCell} 
                    dangerouslySetInnerHTML={{ __html: limitarTextoComando(a.comando) }} 
                    onClick={(e) => handleTooltipClick(e, a.codigo)}
                  />
                  {a.comando && (
                    <div 
                      className={`${styles.tooltip} ${activeTooltip === a.codigo ? styles.tooltipActive : ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div dangerouslySetInnerHTML={{ __html: a.comando }} />
                    </div>
                  )}
                </div>
              </td>
              <td><RelevanciaStars relevancia={a.relevancia} /></td>
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
              <h3>Status da Meta</h3>
              <button className={styles.closeButton} onClick={handleModalClose}>
                &times;
              </button>
            </div>
            
            <div className={styles.modalContent}>
              {selectedActivity.status === 'Concluída' ? (
                <div className={styles.completedMetaInfo}>
                  <div className={styles.completedMetaHeader}>
                    <h4>Meta Concluída</h4>
                    <p>Esta meta já foi concluída e não pode ser modificada.</p>
                  </div>
                  
                  <div className={styles.completedMetaDetails}>
                    <div className={styles.completedMetaItem}>
                      <span className={styles.completedMetaLabel}>Tempo Estudado:</span>
                      <span className={styles.completedMetaValue}>{selectedActivity.tempo}</span>
                    </div>
                    
                    {selectedActivity.totalQuestoes > 0 && (
                      <>
                        <div className={styles.completedMetaItem}>
                          <span className={styles.completedMetaLabel}>Questões Respondidas:</span>
                          <span className={styles.completedMetaValue}>{selectedActivity.totalQuestoes}</span>
                        </div>
                        <div className={styles.completedMetaItem}>
                          <span className={styles.completedMetaLabel}>Questões Corretas:</span>
                          <span className={styles.completedMetaValue}>{selectedActivity.questoesCorretas}</span>
                        </div>
                        <div className={styles.completedMetaItem}>
                          <span className={styles.completedMetaLabel}>Desempenho:</span>
                          <span className={styles.completedMetaValue}>
                            {selectedActivity.desempenho ? selectedActivity.desempenho.toString().replace('%', '') : '0'}%
                          </span>
                        </div>
                      </>
                    )}
                </div>
                </div>
              ) : (
                <>
                  <div className={styles.metaHeader}>
                <div className={`${styles.metaInfoGroup} ${styles.titleGroup}`}>
                      <span className={styles.metaInfoLabel}>Comando</span>
                      <div className={styles.comandoContent} dangerouslySetInnerHTML={{ __html: selectedActivity.comando }} />
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                {errorMessage && (
                  <div className={styles.errorMessage}>
                    {errorMessage}
                  </div>
                )}
                
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
                      <button 
                        type="button" 
                        className={styles.timeControlButton} 
                        onClick={() => handleTimeIncrement('horas')}
                      >
                        +
                      </button>
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
                      <button 
                        type="button" 
                        className={styles.timeControlButton} 
                        onClick={() => handleTimeDecrement('horas')}
                      >
                        -
                      </button>
                      <span className={styles.timeLabel}>horas</span>
                    </div>
                    
                    <span className={styles.timeSeparator}>:</span>
                    
                    <div className={styles.timeInputGroup}>
                      <button 
                        type="button" 
                        className={styles.timeControlButton} 
                        onClick={() => handleTimeIncrement('minutos')}
                      >
                        +
                      </button>
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
                      <button 
                        type="button" 
                        className={styles.timeControlButton} 
                        onClick={() => handleTimeDecrement('minutos')}
                      >
                        -
                      </button>
                      <span className={styles.timeLabel}>minutos</span>
                    </div>
                  </div>
                </div>
                
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
                      <div className={styles.questionResultLabel}>Desempenho</div>
                      <div className={styles.questionResultValue}>
                        {calcularPorcentagemAcerto()}
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 