import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import styles from './ListPlans.module.css';

export default function ListPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // TODO: Implementar chamada à API
    // Por enquanto usando dados mockados
    const mockPlans = [
      {
        id: 1,
        nome: 'Plano de Estudos - Matemática',
        cargo: 'Professor de Matemática',
        descricao: 'Plano completo de estudos para professores de matemática',
        duracao: 6,
        disciplinas: [
          {
            nome: 'Matemática',
            assuntos: ['Álgebra', 'Geometria', 'Trigonometria']
          }
        ]
      },
      {
        id: 2,
        nome: 'Plano de Estudos - Português',
        cargo: 'Professor de Português',
        descricao: 'Plano completo de estudos para professores de português',
        duracao: 4,
        disciplinas: [
          {
            nome: 'Português',
            assuntos: ['Gramática', 'Literatura', 'Redação']
          }
        ]
      }
    ];

    setPlans(mockPlans);
    setLoading(false);
  }, []);

  const handleEdit = (planId) => {
    navigate(`/planos/editar/${planId}`);
  };

  const handleDelete = async (planId) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        // TODO: Implementar chamada à API
        setPlans(prev => prev.filter(plan => plan.id !== planId));
      } catch (error) {
        console.error('Erro ao excluir plano:', error);
        setError('Erro ao excluir plano. Tente novamente.');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>Carregando planos...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Planos de Estudos</h1>
          <button
            onClick={() => navigate('/planos/cadastrar')}
            className={styles.addButton}
          >
            Novo Plano
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            <p>Erro: {error}</p>
            <p>Por favor, tente novamente.</p>
          </div>
        )}

        {plans.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhum plano cadastrado.</p>
            <button
              onClick={() => navigate('/planos/cadastrar')}
              className={styles.addButton}
            >
              Cadastrar Primeiro Plano
            </button>
          </div>
        ) : (
          <div className={styles.plansGrid}>
            {plans.map(plan => (
              <div key={plan.id} className={styles.planCard}>
                <div className={styles.planHeader}>
                  <h2>{plan.nome}</h2>
                  <div className={styles.planActions}>
                    <button
                      onClick={() => handleEdit(plan.id)}
                      className={styles.editButton}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className={styles.deleteButton}
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                <div className={styles.planInfo}>
                  <p><strong>Cargo:</strong> {plan.cargo}</p>
                  <p><strong>Duração:</strong> {plan.duracao} meses</p>
                  <p><strong>Descrição:</strong> {plan.descricao}</p>
                </div>

                <div className={styles.disciplines}>
                  <h3>Disciplinas</h3>
                  <div className={styles.disciplinesList}>
                    {plan.disciplinas.map(discipline => (
                      <div key={discipline.nome} className={styles.discipline}>
                        <span className={styles.disciplineName}>
                          {discipline.nome}
                        </span>
                        <span className={styles.assuntosCount}>
                          {discipline.assuntos.length} {discipline.assuntos.length === 1 ? 'assunto' : 'assuntos'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 