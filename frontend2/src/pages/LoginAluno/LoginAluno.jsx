import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BackgroundConnections from '../../components/BackgroundConnections';
import styles from './LoginAluno.module.css';
import authService from '../../services/authService';

const LoginAluno = () => {
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
      console.log('Iniciando processo de login de aluno...');
      
      // Login específico para aluno (sem parâmetro grupo)
      const response = await authService.loginAluno({
        login: formData.login,
        senha: formData.senha
      });

      console.log('Login de aluno bem-sucedido:', response);
      
      // Redireciona para o dashboard de aluno
      navigate('/aluno/dashboard');
    } catch (error) {
      console.error('Erro no login de aluno:', error);
      if (error.response?.status === 401) {
        if (error.response?.data?.message === 'Senha não definida para este aluno') {
          setError('Sua senha ainda não foi definida. Entre em contato com o administrador.');
        } else {
          setError('Login ou senha incorretos');
        }
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
          <h1 className={styles.title}>Área do Aluno</h1>
          <p className={styles.subtitle}>Entre com suas credenciais para acessar sua área de estudos</p>
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

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar como Aluno'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            É administrador?{' '}
            <Link to="/admin/login" className={styles.link}>
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

export default LoginAluno;
