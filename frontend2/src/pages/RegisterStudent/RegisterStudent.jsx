import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { alunoService } from '../../services/alunoService';
import styles from './RegisterStudent.module.css';

export default function RegisterStudent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (showList) {
      carregarAlunos();
    }
  }, [showList]);

  const carregarAlunos = async () => {
    try {
      const data = await alunoService.listarAlunos();
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setError('Erro ao carregar lista de alunos');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await alunoService.cadastrarAluno(formData);
      alert('Aluno cadastrado com sucesso!');
      setFormData({ nome: '', email: '', cpf: '' });
      if (showList) {
        carregarAlunos();
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao cadastrar aluno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1>Cadastrar Aluno</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Digite o nome completo"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Digite o e-mail"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
              placeholder="Digite o CPF"
              maxLength="14"
              disabled={loading}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Aluno'}
            </button>
            <button
              type="button"
              onClick={() => setShowList(!showList)}
              className={styles.listButton}
              disabled={loading}
            >
              {showList ? 'Ocultar Lista' : 'Listar Alunos'}
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

        {showList && (
          <div className={styles.tableContainer}>
            <h2>Lista de Alunos</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>CPF</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno) => (
                  <tr key={aluno.id}>
                    <td>{aluno.nome}</td>
                    <td>{aluno.email}</td>
                    <td>{aluno.cpf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
} 