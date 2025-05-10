import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterPlan.module.css';
import { planoService } from '../../services/planoService';

// Log para depuração
console.log('RegisterPlan - Token:', localStorage.getItem('token'));

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

export default function RegisterPlan() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: '',
    cargo: '',
    disciplinas: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentDiscipline, setCurrentDiscipline] = useState(null);
  const [assuntos, setAssuntos] = useState([]);
  const [novoAssunto, setNovoAssunto] = useState('');
  const [editingDiscipline, setEditingDiscipline] = useState(null);

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
      const dataToSubmit = {
        ...formData,
        disciplinas: selectedDisciplines
      };
      console.log('1. Dados do plano antes de enviar:', dataToSubmit);
      console.log('2. Verificando estrutura dos dados:');
      console.log('- Nome:', dataToSubmit.nome);
      console.log('- Cargo:', dataToSubmit.cargo);
      console.log('- Descrição:', dataToSubmit.descricao);
      console.log('- Duração:', dataToSubmit.duracao);
      console.log('- Disciplinas:', dataToSubmit.disciplinas);
      
      await planoService.cadastrarPlano(dataToSubmit);
      console.log('3. Plano cadastrado com sucesso');
      alert('Plano cadastrado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('4. Erro detalhado ao cadastrar plano:', error);
      console.error('5. Mensagem de erro:', error.message);
      console.error('6. Stack trace:', error.stack);
      setError(error.message || 'Erro ao cadastrar plano. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Cadastrar Plano</h1>
      
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
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
            {loading ? 'Cadastrando...' : 'Cadastrar Plano'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/planos')}
            className={styles.listButton}
            disabled={loading}
          >
            Listar Planos
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
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
  );
} 