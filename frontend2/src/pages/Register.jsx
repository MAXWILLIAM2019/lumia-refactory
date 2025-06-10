import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BackgroundConnections from '../components/BackgroundConnections';
import styles from './Register.module.css';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    grupo: 'aluno'
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
      const payload = {
        nome: formData.nome,
        login: formData.email,
        senha: formData.senha,
        grupo: formData.grupo
      };
      const response = await api.post('/auth/register', payload);
      
      if (response.data.success) {
        navigate('/login');
      } else {
        throw new Error(response.data.message || 'Erro ao registrar');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao registrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <BackgroundConnections />
      <div className={styles.registerBox}>
        <h1 className={styles.title}>Criar Conta</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="nome" className={styles.label}>
              Nome
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={styles.input}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Seu email (será seu login)"
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
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>

        <div className={styles.loginLink}>
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 