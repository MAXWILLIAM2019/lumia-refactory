import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sprints.module.css';
import api from '../../services/api';

/**
 * Componente Sprints
 * Exibe a listagem de todas as sprints cadastradas
 */
export default function Sprints() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSprints();
  }, []);

  /**
   * Busca todas as sprints do backend
   */
  const fetchSprints = async () => {
    try {
      const response = await api.get('/sprints');
      setSprints(response.data);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao carregar sprints');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navega para a página de cadastro de sprint
   */
  const handleRegisterClick = () => {
    navigate('/register-sprint');
  };

  /**
   * Navega para a página de edição de sprint
   * @param {number} sprintId - ID da sprint a ser editada
   */
  const handleEditClick = (sprintId) => {
    navigate(`/edit-sprint/${sprintId}`);
  };

  if (loading) {
    return <div className={styles.loading}>Carregando sprints...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Sprints Cadastradas</h1>
        <button 
          className={styles.registerButton}
          onClick={handleRegisterClick}
        >
          + Nova Sprint
        </button>
      </div>

      <div className={styles.sprintsList}>
        {sprints.map((sprint) => (
          <div key={sprint.id} className={styles.sprintCard}>
            <div className={styles.sprintHeader}>
              <div className={styles.sprintTitleContainer}>
                <h2>{sprint.nome}</h2>
                <span className={styles.date}>
                  {new Date(sprint.dataInicio).toLocaleDateString()} - {new Date(sprint.dataFim).toLocaleDateString()}
                </span>
              </div>
              <button 
                className={styles.editButton}
                onClick={() => handleEditClick(sprint.id)}
                title="Editar sprint"
              >
                ✏️
              </button>
            </div>
            
            <div className={styles.activities}>
              <h3>Disciplinas</h3>
              <ul>
                {sprint.atividades.map((atividade, index) => (
                  <li key={index} className={styles.activityItem}>
                    <div className={styles.activityInfo}>
                      <span className={styles.discipline}>{atividade.disciplina}</span>
                      <span className={styles.title}>{atividade.titulo}</span>
                    </div>
                    <div className={styles.activityDetails}>
                      <span className={styles.type}>{atividade.tipo}</span>
                      <span className={styles.relevance}>
                        {'★'.repeat(atividade.relevancia)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 