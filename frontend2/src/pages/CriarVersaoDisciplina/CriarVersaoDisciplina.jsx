import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CriarVersaoDisciplina.module.css';
import { disciplinaService } from '../../services/disciplinaService';
import api from '../../services/api';
import backIcon from '../../assets/icons/menu.svg';

export default function CriarVersaoDisciplina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [disciplinaOriginal, setDisciplinaOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativa: true,
    copiarAssuntos: true
  });
  const [assuntos, setAssuntos] = useState([]);
  const [novoAssunto, setNovoAssunto] = useState('');

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/disciplinas/${id}`);
      setDisciplinaOriginal(response.data);
      
      // Pré-preencher o nome da disciplina com um sufixo para indicar versão
      setFormData(prev => ({
        ...prev,
        nome: `${response.data.nome} - Nova Versão`,
        descricao: response.data.descricao || ''
      }));
      
      // Se copiarAssuntos estiver marcado, pré-popular os assuntos
      if (formData.copiarAssuntos && response.data.assuntos) {
        setAssuntos(response.data.assuntos.map(a => a.nome));
      }
    } catch (error) {
      console.error('Erro ao carregar disciplina:', error);
      setError('Não foi possível carregar os dados da disciplina. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Para os campos checkbox como "ativa" e "copiarAssuntos"
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      
      // Se o checkbox copiarAssuntos foi alterado, atualizar a lista de assuntos
      if (name === 'copiarAssuntos') {
        if (checked && disciplinaOriginal?.assuntos) {
          setAssuntos(disciplinaOriginal.assuntos.map(a => a.nome));
        } else if (!checked) {
          setAssuntos([]);
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome) {
      alert('O nome da disciplina é obrigatório.');
      return;
    }
    
    try {
      setProcessando(true);
      setError('');
      
      const dadosVersao = {
        ...formData,
        assuntos: assuntos.map(nome => ({ nome }))
      };
      
      await disciplinaService.criarVersaoDisciplina(id, dadosVersao);
      alert('Nova versão da disciplina criada com sucesso!');
      navigate(`/disciplinas/${id}/versoes`);
    } catch (error) {
      console.error('Erro ao criar versão:', error);
      setError(error.response?.data?.message || 'Erro ao criar nova versão. Tente novamente.');
    } finally {
      setProcessando(false);
    }
  };

  const handleVoltar = () => {
    navigate(`/disciplinas/${id}/versoes`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando dados da disciplina...</div>
      </div>
    );
  }

  if (!disciplinaOriginal) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Disciplina não encontrada</p>
          <button onClick={() => navigate('/disciplinas')}>Voltar para Disciplinas</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleVoltar}>
          <img src={backIcon} alt="Voltar" />
          <span>Voltar</span>
        </button>
        <h1>Nova Versão da Disciplina</h1>
      </div>
      
      <div className={styles.originalInfo}>
        <h2>Disciplina Original: {disciplinaOriginal.nome}</h2>
        {disciplinaOriginal.versao && (
          <span className={styles.versaoNumber}>Versão atual: v{disciplinaOriginal.versao}</span>
        )}
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="nome">Nome da Nova Versão</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={styles.textInput}
            required
            disabled={processando}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            className={styles.textareaInput}
            rows={4}
            disabled={processando}
            placeholder="Descreva o que foi alterado nesta versão..."
          />
        </div>
        
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="ativa"
            name="ativa"
            checked={formData.ativa}
            onChange={handleChange}
            disabled={processando}
          />
          <label htmlFor="ativa">Versão Ativa</label>
        </div>
        
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="copiarAssuntos"
            name="copiarAssuntos"
            checked={formData.copiarAssuntos}
            onChange={handleChange}
            disabled={processando}
          />
          <label htmlFor="copiarAssuntos">Copiar assuntos da versão original</label>
        </div>
        
        <div className={styles.assuntosSection}>
          <h3>Assuntos</h3>
          <p className={styles.assuntosHelp}>
            {formData.copiarAssuntos 
              ? 'Os assuntos da versão original foram copiados. Você pode adicionar mais ou remover existentes.' 
              : 'Adicione os assuntos para esta nova versão.'}
          </p>
          
          <div className={styles.assuntosInput}>
            <input
              type="text"
              value={novoAssunto}
              onChange={(e) => setNovoAssunto(e.target.value)}
              placeholder="Digite um assunto"
              disabled={processando}
            />
            <button
              type="button"
              onClick={handleAddAssunto}
              disabled={!novoAssunto || processando}
              className={styles.addAssuntoBtn}
            >
              +
            </button>
          </div>
          
          {assuntos.length > 0 ? (
            <div className={styles.assuntosList}>
              {assuntos.map((assunto, index) => (
                <div key={index} className={styles.assuntoItem}>
                  <span>{assunto}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAssunto(assunto)}
                    className={styles.removeAssuntoBtn}
                    disabled={processando}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noAssuntos}>Nenhum assunto adicionado</p>
          )}
        </div>
        
        <div className={styles.actionsContainer}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={processando}
          >
            {processando ? 'Criando Versão...' : 'Criar Nova Versão'}
          </button>
          <button
            type="button"
            onClick={handleVoltar}
            className={styles.cancelButton}
            disabled={processando}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
} 