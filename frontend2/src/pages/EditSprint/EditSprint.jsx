import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './EditSprint.module.css';
import api from '../../services/api';

const PREDEFINED_DISCIPLINES = [
  'Matemática',
  'Português',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Inglês',
  'Literatura',
  'Redação'
];

export default function EditSprint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    activities: [{ 
      discipline: '', 
      customDiscipline: '', 
      title: '',
      type: 'teoria', 
      relevance: 1
    }]
  });

  useEffect(() => {
    fetchSprint();
  }, [id]);

  const fetchSprint = async () => {
    try {
      const response = await api.get(`/sprints/${id}`);
      const sprint = response.data;
      setFormData({
        title: sprint.nome,
        startDate: sprint.dataInicio,
        endDate: sprint.dataFim,
        activities: sprint.metas.map(meta => ({
          discipline: PREDEFINED_DISCIPLINES.includes(meta.disciplina) ? meta.disciplina : 'custom',
          customDiscipline: !PREDEFINED_DISCIPLINES.includes(meta.disciplina) ? meta.disciplina : '',
          title: meta.titulo,
          type: meta.tipo,
          relevance: meta.relevancia
        }))
      });
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao carregar sprint. Tente novamente.');
      navigate('/sprints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/sprints/${id}`,
        {
          nome: formData.title,
          dataInicio: formData.startDate,
          dataFim: formData.endDate,
          metas: formData.activities.map(activity => ({
            disciplina: activity.discipline === 'custom' ? activity.customDiscipline : activity.discipline,
            tipo: activity.type,
            titulo: activity.title,
            relevancia: activity.relevance
          }))
        }
      );
      alert('Sprint atualizada com sucesso!');
      navigate('/sprints');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar sprint. Tente novamente.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActivityChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === index ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, { 
        discipline: '', 
        customDiscipline: '', 
        title: '',
        type: 'teoria', 
        relevance: 1
      }]
    }));
  };

  const removeActivity = (index) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div className={styles.loading}>Carregando sprint...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Editar Sprint</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Nome da Sprint</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.dateGroup}>
          <div className={styles.formGroup}>
            <label htmlFor="startDate">Data de Início</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endDate">Data de Término</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.activitiesSection}>
          <h2>Metas</h2>
          {formData.activities.map((activity, index) => (
            <div key={index} className={styles.activityCard}>
              <div className={styles.activityHeader}>
                <h3>Meta {index + 1}</h3>
                {formData.activities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className={styles.removeButton}
                  >
                    Remover
                  </button>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Disciplina</label>
                <select
                  value={activity.discipline}
                  onChange={(e) => handleActivityChange(index, 'discipline', e.target.value)}
                  required
                >
                  <option value="">Selecione uma disciplina</option>
                  {PREDEFINED_DISCIPLINES.map(discipline => (
                    <option key={discipline} value={discipline}>
                      {discipline}
                    </option>
                  ))}
                  <option value="custom">Outra</option>
                </select>
              </div>

              {activity.discipline === 'custom' && (
                <div className={styles.formGroup}>
                  <label>Nome da Disciplina</label>
                  <input
                    type="text"
                    value={activity.customDiscipline}
                    onChange={(e) => handleActivityChange(index, 'customDiscipline', e.target.value)}
                    required
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Título da Meta</label>
                <input
                  type="text"
                  value={activity.title}
                  onChange={(e) => handleActivityChange(index, 'title', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tipo</label>
                <select
                  value={activity.type}
                  onChange={(e) => handleActivityChange(index, 'type', e.target.value)}
                  required
                >
                  <option value="teoria">Teoria</option>
                  <option value="questoes">Questões</option>
                  <option value="revisao">Revisão</option>
                  <option value="reforco">Reforço</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Relevância</label>
                <select
                  value={activity.relevance}
                  onChange={(e) => handleActivityChange(index, 'relevance', parseInt(e.target.value))}
                  required
                >
                  <option value={1}>★</option>
                  <option value={2}>★★</option>
                  <option value={3}>★★★</option>
                  <option value={4}>★★★★</option>
                  <option value={5}>★★★★★</option>
                </select>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addActivity}
            className={styles.addButton}
          >
            + Adicionar Meta
          </button>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            Salvar Alterações
          </button>
          <button
            type="button"
            onClick={() => navigate('/sprints')}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
} 