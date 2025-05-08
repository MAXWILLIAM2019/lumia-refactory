import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import styles from './ListPlans.module.css';
import { planoService } from '../../services/planoService';

export default function ListPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      console.log('1. Iniciando busca de planos...');
      try {
        console.log('2. Chamando planoService.listarPlanos()');
        const data = await planoService.listarPlanos();
        console.log('3. Dados recebidos:', data);
        setPlans(data);
        console.log('4. Estado plans atualizado:', data);
      } catch (error) {
        console.error('5. Erro ao buscar planos:', error);
        console.error('6. Detalhes do erro:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError(error.message || 'Erro ao carregar planos. Tente novamente.');
      } finally {
        console.log('7. Finalizando carregamento');
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleEdit = (planId) => {
    navigate(`/planos/editar/${planId}`);
  };

  const handleDelete = async (planId) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await planoService.excluirPlano(planId);
        setPlans(prev => prev.filter(plan => plan.id !== planId));
      } catch (error) {
        console.error('Erro ao excluir plano:', error);
        setError(error.message || 'Erro ao excluir plano. Tente novamente.');
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
                    {plan.Disciplinas?.map(discipline => (
                      <div key={discipline.id} className={styles.discipline}>
                        <span className={styles.disciplineName}>
                          {discipline.nome}
                        </span>
                        <span className={styles.assuntosCount}>
                          {discipline.Assuntos?.length || 0} {discipline.Assuntos?.length === 1 ? 'assunto' : 'assuntos'}
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