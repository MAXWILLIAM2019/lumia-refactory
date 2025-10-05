import React, { useState, useEffect } from 'react';
import styles from './AlunoEditModal.module.css';

export default function AlunoEditModal({ open, onClose, aluno, planos, onSave, loading }) {
  const [form, setForm] = useState({ nome: '', email: '', cpf: '', planoId: '' });

  useEffect(() => {
    if (aluno) {
      setForm({
        nome: aluno.nome || '',
        email: aluno.email || '',
        cpf: aluno.cpf || '',
        planoId: aluno.planoId || ''
      });
    }
  }, [aluno]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Editar Aluno</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              placeholder="Digite o nome completo"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Digite o e-mail"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              required
              placeholder="Digite o CPF"
              maxLength="14"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="planoId">Plano</label>
            <select
              id="planoId"
              name="planoId"
              value={form.planoId}
              onChange={handleChange}
            >
              <option value="">Selecione um plano</option>
              {planos.map(plano => (
                <option key={plano.id} value={plano.id}>
                  {plano.nome} - {plano.cargo} ({plano.duracao} meses)
                </option>
              ))}
            </select>
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
} 