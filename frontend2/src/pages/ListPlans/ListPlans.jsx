import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import styles from './ListPlans.module.css';
import { planoService } from '../../services/planoService';

const PREDEFINED_DISCIPLINES = [
  'Matemática',
  'Português',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Inglês',
  'Literatura',
  'Redação'
];

export default function ListPlans() {
  const navigate = useNavigate();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlano, setEditingPlano] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: '',
    cargo: '',
    disciplinas: []
  });
  const [selectedDisciplines, setSelectedDisciplines] = useState([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [currentDiscipline, setCurrentDiscipline] = useState(null);
  const [assuntos, setAssuntos] = useState([]);
  const [novoAssunto, setNovoAssunto] = useState('');
  const [editingDiscipline, setEditingDiscipline] = useState(null);

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const data = await planoService.listarPlanos();
      setPlanos(data);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      setError('Erro ao carregar planos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plano) => {
    setEditingPlano(plano);
    setFormData({
      nome: plano.nome,
      descricao: plano.descricao,
      duracao: plano.duracao,
      cargo: plano.cargo
    });
    
    // Transforma as disciplinas do formato do backend para o formato do frontend
    const disciplinasFormatadas = plano.Disciplinas.map(disciplina => ({
      nome: disciplina.nome,
      assuntos: disciplina.Assuntos.map(assunto => ({ nome: assunto.nome }))
    }));
    
    setSelectedDisciplines(disciplinasFormatadas);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await planoService.excluirPlano(id);
        setPlanos(planos.filter(plano => plano.id !== id));
      } catch (error) {
        console.error('Erro ao excluir plano:', error);
        setError('Erro ao excluir plano. Tente novamente.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDisciplineChange = (e) => {
    setSelectedDiscipline(e.target.value);
  };

  const handleAddDiscipline = () => {
    if (selectedDiscipline && !selectedDisciplines.some(d => d.nome === selectedDiscipline)) {
      setCurrentDiscipline(selectedDiscipline);
      setShowDisciplineModal(true);
    }
  };

  const handleAddAssunto = () => {
    if (novoAssunto && !assuntos.includes(novoAssunto)) {
      setAssuntos(prev => [...prev, novoAssunto]);
      setNovoAssunto('');
    }
  };

  const handleRemoveAssunto = (assunto) => {
    setAssuntos(prev => prev.filter(a => a !== assunto));
  };

  const handleEditDiscipline = (discipline) => {
    setCurrentDiscipline(discipline.nome);
    setAssuntos(discipline.assuntos.map(a => a.nome));
    setShowDisciplineModal(true);
    setEditingDiscipline(discipline);
  };

  const handleConfirmDiscipline = () => {
    if (assuntos.length > 0) {
      if (editingDiscipline) {
        setSelectedDisciplines(prev => prev.map(d => 
          d.nome === editingDiscipline.nome 
            ? { ...d, assuntos: assuntos.map(assunto => ({ nome: assunto })) }
            : d
        ));
        setEditingDiscipline(null);
      } else {
        setSelectedDisciplines(prev => [...prev, {
          nome: currentDiscipline,
          assuntos: assuntos.map(assunto => ({ nome: assunto }))
        }]);
      }
      setShowDisciplineModal(false);
      setCurrentDiscipline(null);
      setAssuntos([]);
      setSelectedDiscipline('');
    }
  };

  const handleCancelDiscipline = () => {
    setShowDisciplineModal(false);
    setCurrentDiscipline(null);
    setAssuntos([]);
    setEditingDiscipline(null);
  };

  const removeDiscipline = (discipline) => {
    setSelectedDisciplines(prev => prev.filter(d => d.nome !== discipline.nome));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const dataToSubmit = {
        ...formData,
        disciplinas: selectedDisciplines
      };
      
      await planoService.atualizarPlano(editingPlano.id, dataToSubmit);
      
      // Atualiza a lista de planos
      await fetchPlanos();
      
      setShowEditModal(false);
      setEditingPlano(null);
      alert('Plano atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      setError(error.message || 'Erro ao atualizar plano. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPlano(null);
    setFormData({
      nome: '',
      descricao: '',
      duracao: '',
      cargo: '',
      disciplinas: []
    });
    setSelectedDisciplines([]);
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>Carregando planos...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Planos de Estudo</h1>
          <button
            onClick={() => navigate('/planos/cadastrar')}
            className={styles.addButton}
          >
            + Novo Plano
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            <p>Erro: {error}</p>
          </div>
        )}

        <div className={styles.plansGrid}>
          {planos.map(plano => (
            <div key={plano.id} className={styles.planCard}>
              <div className={styles.planHeader}>
                <h2>{plano.nome}</h2>
                <div className={styles.planActions}>
                  <button
                    onClick={() => handleEdit(plano)}
                    className={styles.editButton}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(plano.id)}
                    className={styles.deleteButton}
                  >
                    Excluir
                  </button>
                </div>
              </div>
              <p className={styles.planDescription}>{plano.descricao}</p>
              <div className={styles.planDetails}>
                <span>Cargo: {plano.cargo}</span>
                <span>Duração: {plano.duracao} meses</span>
              </div>
              <div className={styles.disciplinesList}>
                {plano.Disciplinas.map(disciplina => (
                  <div key={disciplina.id} className={styles.disciplineTag}>
                    {disciplina.nome}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Edição */}
        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Editar Plano</h2>
                <button
                  onClick={handleCloseEditModal}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="nome">Nome do Plano</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    placeholder="Digite o nome do plano"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="cargo">Cargo</label>
                  <input
                    type="text"
                    id="cargo"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    required
                    placeholder="Digite o cargo"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="descricao">Descrição</label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    required
                    placeholder="Digite a descrição do plano"
                    disabled={loading}
                    rows="4"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="duracao">Duração (meses)</label>
                  <input
                    type="number"
                    id="duracao"
                    name="duracao"
                    value={formData.duracao}
                    onChange={handleChange}
                    required
                    placeholder="Digite a duração em meses"
                    min="1"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Disciplinas</label>
                  <div className={styles.disciplineSelector}>
                    <select
                      value={selectedDiscipline}
                      onChange={handleDisciplineChange}
                      disabled={loading}
                      className={styles.disciplineSelect}
                    >
                      <option value="">Selecione uma disciplina</option>
                      {PREDEFINED_DISCIPLINES.map(discipline => (
                        <option key={discipline} value={discipline}>
                          {discipline}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddDiscipline}
                      disabled={loading || !selectedDiscipline}
                      className={styles.addDisciplineButton}
                    >
                      +
                    </button>
                  </div>
                </div>

                {selectedDisciplines.length > 0 && (
                  <div className={styles.selectedDisciplines}>
                    <h3>Disciplinas Selecionadas</h3>
                    <div className={styles.disciplinesList}>
                      {selectedDisciplines.map(discipline => (
                        <div key={discipline.nome} className={styles.selectedDiscipline}>
                          <div className={styles.disciplineInfo}>
                            <span className={styles.disciplineName}>{discipline.nome}</span>
                            <span className={styles.assuntosCount}>
                              {discipline.assuntos.length} {discipline.assuntos.length === 1 ? 'assunto' : 'assuntos'}
                            </span>
                          </div>
                          <div className={styles.disciplineActions}>
                            <button
                              type="button"
                              onClick={() => handleEditDiscipline(discipline)}
                              className={styles.editDisciplineButton}
                            >
                              Editar Assuntos
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDiscipline(discipline)}
                              className={styles.removeDisciplineButton}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.buttonGroup}>
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? 'Atualizando...' : 'Atualizar Plano'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className={styles.cancelButton}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Disciplinas */}
        {showDisciplineModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>{editingDiscipline ? 'Editar Assuntos' : 'Adicionar Assuntos'} - {currentDiscipline}</h2>
              
              <div className={styles.assuntosInput}>
                <input
                  type="text"
                  value={novoAssunto}
                  onChange={(e) => setNovoAssunto(e.target.value)}
                  placeholder="Digite um assunto"
                  className={styles.assuntoInput}
                />
                <button
                  type="button"
                  onClick={handleAddAssunto}
                  disabled={!novoAssunto}
                  className={styles.addAssuntoButton}
                >
                  +
                </button>
              </div>

              {assuntos.length > 0 && (
                <div className={styles.assuntosList}>
                  {assuntos.map(assunto => (
                    <div key={assunto} className={styles.assuntoItem}>
                      <span>{assunto}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAssunto(assunto)}
                        className={styles.removeAssuntoButton}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.modalButtons}>
                <button
                  type="button"
                  onClick={handleConfirmDiscipline}
                  disabled={assuntos.length === 0}
                  className={styles.confirmButton}
                >
                  {editingDiscipline ? 'Salvar Alterações' : 'Confirmar'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelDiscipline}
                  className={styles.cancelModalButton}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 