import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BackgroundConnections from '../../components/BackgroundConnections';
import styles from './LoginAdmin.module.css';
import authService from '../../services/authService';

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login: '',
    senha: ''
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
      console.log('Iniciando processo de login administrativo...');
      
      // Login específico para administrador (sem parâmetro grupo)
      const response = await authService.loginAdmin({
        login: formData.login,
        senha: formData.senha
      });

      console.log('Login administrativo bem-sucedido:', response);
      
      // Redireciona para o dashboard administrativo
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login administrativo:', error);
      if (error.response?.status === 401) {
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
        <div className={styles.header}>
          <h1 className={styles.title}>Acesso Administrativo</h1>
          <p className={styles.subtitle}>Entre com suas credenciais para acessar o painel administrativo</p>
        </div>
        
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
              placeholder="Seu login administrativo"
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

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar como Administrador'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            É aluno?{' '}
            <Link to="/login" className={styles.link}>
              Acesse aqui
            </Link>
          </p>
          <p className={styles.footerText}>
            Não tem uma conta?{' '}
            <Link to="/register" className={styles.link}>
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
