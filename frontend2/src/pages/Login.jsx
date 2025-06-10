import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BackgroundConnections from '../components/BackgroundConnections';
import styles from './Login.module.css';
import authService from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login: '',
    senha: '',
    grupo: 'aluno' // valor padrão
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Iniciando processo de login com:', {
        login: formData.login,
        grupo: formData.grupo
      });
      
      // Usa o método login do authService
      const response = await authService.login({
        login: formData.login,
        senha: formData.senha,
        grupo: formData.grupo
      });

      console.log('Resposta do login:', response);
      
      // Verifica se o grupo retornado pelo backend corresponde ao selecionado
      if (response.grupo !== formData.grupo) {
        console.log('Grupo não corresponde:', {
          esperado: formData.grupo,
          recebido: response.grupo
        });
        throw new Error('Tipo de usuário incorreto');
      }
      
      // Redireciona conforme o grupo
      if (response.grupo === 'administrador') {
        console.log('Redirecionando para dashboard do administrador');
        navigate('/dashboard');
      } else if (response.grupo === 'aluno') {
        console.log('Redirecionando para dashboard do aluno');
        navigate('/aluno/dashboard');
      } else {
        console.log('Redirecionando para página inicial');
        navigate('/');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (error.message === 'Tipo de usuário incorreto') {
        setError('Tipo de usuário incorreto. Por favor, selecione o tipo correto.');
      } else if (error.response?.status === 401) {
        setError('Login ou senha incorretos');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Erro ao fazer login. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <BackgroundConnections />
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Acesso ao Sistema</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="login" className={styles.label}>
              Login
            </label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              className={styles.input}
              placeholder="Seu login"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="senha" className={styles.label}>
              Senha
            </label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className={styles.input}
              placeholder="Sua senha"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="grupo" className={styles.label}>
              Perfil
            </label>
            <select
              id="grupo"
              name="grupo"
              value={formData.grupo}
              onChange={handleChange}
              className={styles.input}
              required
            >
              <option value="aluno">Aluno</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className={styles.registerLink}>
          Não tem uma conta? <Link to="/register">Registre-se</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 