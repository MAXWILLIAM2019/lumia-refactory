import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../RegisterPlan/RegisterPlan.module.css';
import { sprintService } from '../../services/sprintService';
import addSprintIcon from '../../assets/icons/add-sprint.svg';

export default function PlanSprints() {
  const { id } = useParams();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        setLoading(true);
        const data = await sprintService.listarSprintsPorPlano(id);
        setSprints(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        setError('Erro ao carregar sprints do plano.');
        setSprints([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSprints();
  }, [id]);

  const NovoSprintCard = (
    <div className={styles.novoPlanoCard} onClick={() => navigate(`/planos/${id}/sprints/cadastrar`.replace('id', 'planoId'))}>
      <div className={styles.novoPlanoIcon}>
        <img src={addSprintIcon} alt="Criar Nova Sprint" width={32} height={32} />
      </div>
      <div>
        <h2>Criar Nova Sprint</h2>
      </div>
    </div>
  );

  const SprintCard = (sprint) => (
    <div className={styles.planoCard} key={sprint.id}>
      <div className={styles.planoCardHeader}>
        <div className={styles.planoCardLogo}></div>
        <div>
          <h2 className={styles.planoCardTitle}>{sprint.nome}</h2>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <h1>Sprints</h1>
      <div className={styles.tabsUnderline}></div>
      {error && <div className={styles.error}>{error}</div>}
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className={styles.cardsGrid}>
          {[NovoSprintCard, ...sprints.map(SprintCard)]}
        </div>
      )}
    </div>
  );
} 