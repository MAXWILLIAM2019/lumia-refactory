import { useState } from 'react';
import styles from './ActivitiesTable.module.css';

/**
 * Componente ActivitiesTable
 * Exibe uma tabela com as atividades da sprint
 * 
 * @param {Object} props
 * @param {Array} props.activities - Lista de atividades a serem exibidas
 * @param {Object} props.activities[].disciplina - Nome da disciplina
 * @param {string} props.activities[].tipo - Tipo da atividade
 * @param {string} props.activities[].titulo - Título da atividade
 * @param {string} props.activities[].relevancia - Nível de relevância (em estrelas)
 * @param {string} props.activities[].tempo - Tempo gasto
 * @param {string} props.activities[].desempenho - Nível de desempenho
 * @param {string} props.activities[].codigo - Código da atividade
 */
export default function ActivitiesTable({ activities, onFilterChange }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'Atividades', count: activities.length },
    { id: 'reforco', label: 'Reforços', count: activities.filter(a => a.tipo === 'reforco').length },
    { id: 'teoria', label: 'Teoria', count: activities.filter(a => a.tipo === 'teoria').length },
    { id: 'exercicio', label: 'Questões', count: activities.filter(a => a.tipo === 'exercicio').length },
    { id: 'revisao', label: 'Revisão', count: activities.filter(a => a.tipo === 'revisao').length }
  ];

  const filteredActivities = activeFilter === 'all' 
    ? activities 
    : activities.filter(a => a.tipo === activeFilter);

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    if (onFilterChange) {
      onFilterChange(filterId);
    }
  };

  return (
    <div className={styles.container}>
      {/* Abas de filtro de atividades */}
      <div className={styles.tabs}>
        {filters.map(filter => (
          <button 
            key={filter.id}
            className={activeFilter === filter.id ? styles.active : ''}
            onClick={() => handleFilterClick(filter.id)}
          >
            {filter.label} | {filter.count}
          </button>
        ))}
      </div>

      {/* Tabela de atividades */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Disciplina</th>
            <th>Tipo</th>
            <th>Título</th>
            <th>Relevância</th>
            <th>Tempo</th>
            <th>Desempenho</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredActivities.map((a, i) => (
            <tr key={a.codigo}>
              <td>{i + 1}</td>
              <td>{a.disciplina}</td>
              <td>{a.tipo}</td>
              <td>{a.titulo}</td>
              <td>{a.relevancia}</td>
              <td>{a.tempo}</td>
              <td>{a.desempenho}</td>
              <td>
                <span className={`${styles.status} ${styles[a.status.toLowerCase()]}`}>
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 