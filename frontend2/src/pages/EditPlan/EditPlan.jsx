import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import styles from './EditPlan.module.css';
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

export default function EditPlan() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: '',
    cargo: '',
    disciplinas: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentDiscipline, setCurrentDiscipline] = useState(null);
  const [assuntos, setAssuntos] = useState([]);
  const [novoAssunto, setNovoAssunto] = useState('');
  const [editingDiscipline, setEditingDiscipline] = useState(null);

  useEffect(() => {
    const fetchPlano = async () => {
      try {
        const plano = await planoService.buscarPlanoPorId(id);
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
      } catch (error) {
        console.error('Erro ao buscar plano:', error);
        setError(error.message || 'Erro ao carregar plano. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlano();
  }, [id]);

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
      setShowModal(true);
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
    setShowModal(true);
    setEditingDiscipline(discipline);
  };

  const handleConfirmDiscipline = () => {
    if (assuntos.length > 0) {
      if (editingDiscipline) {
        // Atualiza a disciplina existente
        setSelectedDisciplines(prev => prev.map(d => 
          d.nome === editingDiscipline.nome 
            ? { ...d, assuntos: assuntos.map(assunto => ({ nome: assunto })) }
            : d
        ));
        setEditingDiscipline(null);
      } else {
        // Adiciona nova disciplina
        setSelectedDisciplines(prev => [...prev, {
          nome: currentDiscipline,
          assuntos: assuntos.map(assunto => ({ nome: assunto }))
        }]);
      }
      setShowModal(false);
      setCurrentDiscipline(null);
      setAssuntos([]);
      setSelectedDiscipline('');
    }
  };

  const handleCancelDiscipline = () => {
    setShowModal(false);
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
      console.log('1. Iniciando atualização do plano');
      console.log('2. ID do plano:', id);
      
      const dataToSubmit = {
        ...formData,
        disciplinas: selectedDisciplines
      };
      
      console.log('3. Dados a serem enviados:', JSON.stringify(dataToSubmit, null, 2));
      
      await planoService.atualizarPlano(id, dataToSubmit);
      console.log('4. Plano atualizado com sucesso');
      
      alert('Plano atualizado com sucesso!');
      navigate('/planos');
    } catch (error) {
      console.error('5. Erro ao atualizar plano:', error);
      console.error('6. Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.message || 'Erro ao atualizar plano. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>Carregando plano...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <h1>Editar Plano</h1>
        
        {error && (
          <div className={styles.error}>
            <p>Erro: {error}</p>
            <p>Por favor, verifique os dados e tente novamente.</p>
          </div>
        )}
        
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
              onClick={() => navigate('/planos')}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>

        {showModal && (
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