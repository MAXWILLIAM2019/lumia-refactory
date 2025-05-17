import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CadastrarDisciplina.module.css';
import api from '../../services/api';

export default function CadastrarDisciplina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    ativa: true
  });
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState('');
  const [assuntos, setAssuntos] = useState([]);
  const [novoAssunto, setNovoAssunto] = useState('');

  useEffect(() => {
    if (id) {
      fetchDisciplina();
    }
  }, [id]);

  const fetchDisciplina = async () => {
    try {
      const response = await api.get(`/disciplinas/${id}`);
      const disciplina = response.data;
      
      setFormData({
        nome: disciplina.nome,
        ativa: disciplina.ativa !== undefined ? disciplina.ativa : true
      });
      
      // Extrair assuntos
      if (disciplina.assuntos && Array.isArray(disciplina.assuntos)) {
        setAssuntos(disciplina.assuntos.map(a => a.nome));
      }
    } catch (error) {
      console.error('Erro ao carregar disciplina:', error);
      setError('Erro ao carregar dados da disciplina. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const disciplinaData = {
        ...formData,
        assuntos: assuntos.map(nome => ({ nome }))
      };
      
      if (id) {
        await api.put(`/disciplinas/${id}`, disciplinaData);
        alert('Disciplina atualizada com sucesso!');
      } else {
        await api.post('/disciplinas', disciplinaData);
        alert('Disciplina cadastrada com sucesso!');
      }
      
      navigate('/disciplinas');
    } catch (error) {
      console.error('Erro:', error);
      setError(error.response?.data?.message || 'Erro ao processar operação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando disciplina...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>{id ? 'Editar Disciplina' : 'Nova Disciplina'}</h1>
      
      {error && (
        <div className={styles.error}>
          <p>Erro: {error}</p>
          <p>Por favor, verifique os dados e tente novamente.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.statusToggleGroup}>
          <div className={styles.toggleContainer}>
            <input
              type="checkbox"
              id="ativa"
              name="ativa"
              checked={formData.ativa}
              onChange={handleChange}
              className={styles.toggleCheckbox}
              disabled={loading}
            />
            <label className={styles.toggleLabel} htmlFor="ativa">
              <span className={styles.toggleButton}></span>
            </label>
          </div>
          <span className={styles.statusValue}>
            {formData.ativa ? 'Ativa' : 'Inativa'}
          </span>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="nome">Nome da Disciplina</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            placeholder="Digite o nome da disciplina"
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Assuntos</label>
          <div className={styles.assuntosInput}>
            <input
              type="text"
              value={novoAssunto}
              onChange={(e) => setNovoAssunto(e.target.value)}
              placeholder="Digite um assunto"
              className={styles.assuntoInput}
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleAddAssunto}
              disabled={!novoAssunto || loading}
              className={styles.addAssuntoButton}
            >
              +
            </button>
          </div>
          
          {assuntos.length > 0 && (
            <div className={styles.assuntosContainer}>
              <h3>Assuntos Adicionados</h3>
              <div className={styles.assuntosList}>
                {assuntos.map((assunto, index) => (
                  <div key={index} className={styles.assuntoItem}>
                    <span>{assunto}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAssunto(assunto)}
                      className={styles.removeAssuntoButton}
                      disabled={loading}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Processando...' : (id ? 'Salvar Alterações' : 'Cadastrar Disciplina')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/disciplinas')}
            className={styles.listButton}
            disabled={loading}
          >
            Listar Disciplinas
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
    </div>
  );
} 