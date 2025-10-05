import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './EditarAlunoModal.module.css';

const EditarAlunoModal = ({ aluno, onSave, onClose, loading }) => {
  const [formData, setFormData] = useState({
    nome: aluno.nome || '',
    email: aluno.email || '',
    cpf: aluno.cpf || '',
    planoId: ''
  });
  const [planosMestre, setPlanosMestre] = useState([]);
  const [loadingPlanos, setLoadingPlanos] = useState(true);

  useEffect(() => {
    const carregarPlanosMestre = async () => {
      try {
        console.log('Carregando planos mestre...');
        const response = await api.get('/planos-mestre');
        console.log('Planos mestre carregados:', response.data);
        setPlanosMestre(response.data);
      } catch (error) {
        console.error('Erro ao carregar planos mestre:', error);
      } finally {
        setLoadingPlanos(false);
      }
    };

    carregarPlanosMestre();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Editar Aluno</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
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
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="planoId">Plano</label>
            {loadingPlanos ? (
              <div>Carregando planos...</div>
            ) : (
              <select
                id="planoId"
                name="planoId"
                value={formData.planoId}
                onChange={handleChange}
              >
                <option value="">Selecione um plano</option>
                {planosMestre.map(plano => (
                  <option key={plano.id} value={plano.id}>
                    {plano.nome} - {plano.cargo} ({plano.duracao} meses)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarAlunoModal; 