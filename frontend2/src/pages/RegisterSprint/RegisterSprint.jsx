import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sprintService } from '../../services/sprintService';
import { planoService } from '../../services/planoService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './RegisterSprint.module.css';

// Disciplinas predefinidas para fallback (serão usadas apenas se a API falhar)
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

const RegisterSprint = () => {
  const navigate = useNavigate();
  const { id, planoId } = useParams();
  const [loading, setLoading] = useState(id ? true : false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [editorContent, setEditorContent] = useState('');
  const [planos, setPlanos] = useState([]);
  const [loadingPlanos, setLoadingPlanos] = useState(true);
  const [disciplinasDoPlanoDisciplinas, setDisciplinasDoPlanoDisciplinas] = useState([]);
  const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);
  const [assuntosDaDisciplina, setAssuntosDaDisciplina] = useState({});
  const [showAssuntosDropdown, setShowAssuntosDropdown] = useState({});
  const [lastLoadedPlanoId, setLastLoadedPlanoId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    planoId: '',
    activities: [{ 
      discipline: '', 
      customDiscipline: '', 
      title: '',
      type: 'teoria', 
      relevance: 1,
      comandos: '',
      link: ''
    }]
  });

  // Configuração do editor Quill
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'code-block'
  ];

  // Carregar planos ao inicializar o componente
  useEffect(() => {
    if (!planoId) {
      carregarPlanos();
    }
  }, [planoId]);

  // Carregar disciplinas quando o plano é selecionado
  useEffect(() => {
    if (formData.planoId || planoId) {
      // Verificar se o ID do plano mudou para evitar carregamentos desnecessários
      if (formData.planoId !== lastLoadedPlanoId) {
        console.log(`Plano alterado de ${lastLoadedPlanoId} para ${formData.planoId}`);
        
        // Resetar estados relacionados a disciplinas e assuntos
        setDisciplinasDoPlanoDisciplinas([]);
        setAssuntosDaDisciplina({});
        
        // Limpar as disciplinas selecionadas nas atividades
        setFormData(prev => ({
          ...prev,
          activities: prev.activities.map(activity => ({
            ...activity,
            discipline: '', // Resetar a disciplina
            customDiscipline: '',
            // Manter outros campos intactos
          }))
        }));
        
        // Carregar disciplinas do novo plano
        carregarDisciplinasDoPlanoDisciplinas(planoId || formData.planoId);
        setLastLoadedPlanoId(planoId || formData.planoId);
      }
    } else {
      // Se não há plano selecionado, limpar as disciplinas
      setDisciplinasDoPlanoDisciplinas([]);
      setAssuntosDaDisciplina({});
      setLastLoadedPlanoId(null);
    }
  }, [formData.planoId, lastLoadedPlanoId, planoId]);

  // Efeito para verificar e buscar assuntos quando uma disciplina é selecionada
  useEffect(() => {
    // Criar um objeto para controlar os dropdowns de assunto
    const novoEstadoDropdown = {};
    formData.activities.forEach((activity, index) => {
      novoEstadoDropdown[index] = false;
    });
    setShowAssuntosDropdown(novoEstadoDropdown);

    // Verificar para cada atividade se precisamos buscar assuntos
    formData.activities.forEach((activity, index) => {
      if (activity.discipline && activity.discipline !== 'custom' && !assuntosDaDisciplina[activity.discipline]) {
        // Buscar assuntos para esta disciplina
        buscarAssuntosDaDisciplina(activity.discipline);
      }
    });
  }, [formData.activities]);

  // Carregamento de planos para o dropdown
  const carregarPlanos = async () => {
    try {
      setLoadingPlanos(true);
      const planosData = await planoService.listarPlanos();
      console.log('Planos carregados:', planosData);
      setPlanos(planosData);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      alert('Não foi possível carregar os planos de estudo. Verifique sua conexão.');
    } finally {
      setLoadingPlanos(false);
    }
  };

  // Carregamento de disciplinas do plano selecionado
  const carregarDisciplinasDoPlanoDisciplinas = async (planoIdParam) => {
    if (!planoIdParam) return;
    try {
      console.log(`Carregando disciplinas do plano ${planoIdParam}...`);
      setLoadingDisciplinas(true);
      const disciplinas = await planoService.buscarDisciplinasPorPlano(planoIdParam);
      console.log(`Disciplinas do plano ${planoIdParam} carregadas:`, disciplinas);
      // Se estiver no fluxo via planoId da URL, sempre setar as disciplinas
      if (planoId || planoIdParam === formData.planoId) {
        setDisciplinasDoPlanoDisciplinas(disciplinas || []);
      } else {
        console.log('Plano alterado durante o carregamento. Ignorando resultados.');
      }
    } catch (error) {
      console.error(`Erro ao carregar disciplinas do plano ${planoIdParam}:`, error);
      setDisciplinasDoPlanoDisciplinas([]);
    } finally {
      setLoadingDisciplinas(false);
    }
  };

  // Buscar assuntos de uma disciplina específica
  const buscarAssuntosDaDisciplina = (disciplinaNome) => {
    // Se já temos os assuntos em cache, não precisamos buscar novamente
    if (assuntosDaDisciplina[disciplinaNome]) {
      return;
    }

    // Procurar a disciplina nas disciplinas do plano
    const disciplina = disciplinasDoPlanoDisciplinas.find(d => d.nome === disciplinaNome);
    if (disciplina && disciplina.assuntos) {
      console.log(`Assuntos encontrados para a disciplina ${disciplinaNome}:`, disciplina.assuntos);
      // Armazenar os assuntos no cache
      setAssuntosDaDisciplina(prev => ({
        ...prev,
        [disciplinaNome]: disciplina.assuntos
      }));
    } else {
      console.log(`Nenhum assunto encontrado para a disciplina ${disciplinaNome}`);
      // Disciplina não encontrada ou sem assuntos
      setAssuntosDaDisciplina(prev => ({
        ...prev,
        [disciplinaNome]: []
      }));
    }
  };

  // Alternar visibilidade do dropdown de assuntos
  const toggleAssuntosDropdown = (index) => {
    setShowAssuntosDropdown(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Selecionar um assunto como título da meta
  const selecionarAssuntoComoTitulo = (index, assuntoNome) => {
    handleActivityChange(index, 'title', assuntoNome);
    toggleAssuntosDropdown(index);
  };

  useEffect(() => {
    if (id) {
      loadSprint();
    }
  }, [id]);

  const loadSprint = async () => {
    try {
      const sprint = await sprintService.buscarSprintPorId(id);
      console.log('Sprint carregada:', sprint);
      
      // Primeiro, definimos o planoId para que as disciplinas sejam carregadas
      const planoId = sprint.PlanoId;
      setLastLoadedPlanoId(planoId); // Importante: registrar qual plano foi carregado
      
      // Carregar as disciplinas do plano
      await carregarDisciplinasDoPlanoDisciplinas(planoId);
      
      // Depois, atualizamos os dados completos do formulário
      setFormData({
        title: sprint.nome,
        startDate: sprint.dataInicio,
        endDate: sprint.dataFim,
        planoId: planoId,
        activities: sprint.metas.map(meta => ({
          discipline: meta.disciplina,
          customDiscipline: '',
          title: meta.titulo,
          type: meta.tipo,
          relevance: meta.relevancia,
          comandos: meta.comandos || '',
          link: meta.link || ''
        }))
      });
    } catch (error) {
      console.error('Erro ao carregar sprint:', error);
      alert('Erro ao carregar sprint. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.planoId && !planoId) {
      alert('Selecione um plano de estudo para a sprint.');
      return;
    }
    
    try {
      const sprintData = {
        nome: formData.title,
        dataInicio: formData.startDate,
        dataFim: formData.endDate,
        planoId: planoId || formData.planoId,
        metas: formData.activities.map(activity => ({
          disciplina: activity.discipline === 'custom' ? activity.customDiscipline : activity.discipline,
          tipo: activity.type,
          titulo: activity.title,
          relevancia: activity.relevance,
          comandos: activity.comandos,
          link: activity.link
        }))
      };

      if (id) {
        await sprintService.atualizarSprint(id, sprintData);
        alert('Sprint atualizada com sucesso!');
      } else {
        await sprintService.cadastrarSprint(sprintData);
        alert('Sprint cadastrada com sucesso!');
      }
      
      navigate('/sprints');
    } catch (error) {
      console.error('Erro:', error);
      alert(error.message || (id ? 'Erro ao atualizar sprint. Tente novamente.' : 'Erro ao cadastrar sprint. Tente novamente.'));
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

    // Se a disciplina foi alterada, fechar o dropdown de assuntos
    if (field === 'discipline') {
      setShowAssuntosDropdown(prev => ({
        ...prev,
        [index]: false
      }));
      
      // E buscar assuntos para a nova disciplina se necessário
      if (value && value !== 'custom' && !assuntosDaDisciplina[value]) {
        buscarAssuntosDaDisciplina(value);
      }
    }
  };

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, { 
        discipline: '', 
        customDiscipline: '', 
        title: '',
        type: 'teoria', 
        relevance: 1,
        comandos: '',
        link: ''
      }]
    }));
    
    // Adicionar o estado do dropdown para a nova atividade
    setShowAssuntosDropdown(prev => ({
      ...prev,
      [formData.activities.length]: false
    }));
  };

  const removeActivity = (index) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
    
    // Remover o estado do dropdown para a atividade removida
    const newShowAssuntosDropdown = { ...showAssuntosDropdown };
    delete newShowAssuntosDropdown[index];
    
    // Reorganizar os índices para os dropdowns restantes
    const updatedDropdownState = {};
    Object.keys(newShowAssuntosDropdown).forEach((key, i) => {
      const keyNum = Number(key);
      if (keyNum > index) {
        updatedDropdownState[keyNum - 1] = newShowAssuntosDropdown[keyNum];
      } else {
        updatedDropdownState[keyNum] = newShowAssuntosDropdown[keyNum];
      }
    });
    
    setShowAssuntosDropdown(updatedDropdownState);
  };

  const openTextEditor = (index, initialContent) => {
    setCurrentActivityIndex(index);
    setEditorContent(initialContent || '');
    setShowTextEditor(true);
  };

  const saveTextEditorContent = () => {
    // Obtenha o elemento ql-editor para verificar se o conteúdo está vazio
    const editorElement = document.querySelector('.ql-editor');
    
    // Se o conteúdo for apenas um parágrafo vazio <p><br></p>, considere-o como vazio
    const isEmpty = editorElement?.innerHTML === '<p><br></p>';
    
    // Se estiver vazio, limpe o campo de comandos, caso contrário salve o conteúdo
    if (isEmpty) {
      handleActivityChange(currentActivityIndex, 'comandos', '');
    } else {
      handleActivityChange(currentActivityIndex, 'comandos', editorContent);
    }
    
    setShowTextEditor(false);
  };

  // Obtém as disciplinas disponíveis para seleção
  const getDisciplinasDisponiveis = () => {
    // Retorna apenas as disciplinas do plano, sem disciplinas predefinidas
    return disciplinasDoPlanoDisciplinas.map(d => d.nome);
  };
  
  // Verificar se uma disciplina tem assuntos disponíveis
  const temAssuntosDisponiveis = (disciplinaNome) => {
    return disciplinaNome && 
           disciplinaNome !== 'custom' && 
           assuntosDaDisciplina[disciplinaNome] && 
           assuntosDaDisciplina[disciplinaNome].length > 0;
  };

  // Depuração: mostrar estados atuais
  console.log('Estado atual:');
  console.log('- Plano ID:', formData.planoId);
  console.log('- Último plano carregado:', lastLoadedPlanoId);
  console.log('- Disciplinas carregadas:', disciplinasDoPlanoDisciplinas.map(d => d.nome));
  console.log('- Assuntos carregados para disciplinas:', Object.keys(assuntosDaDisciplina));

  useEffect(() => {
    if (planoId && !formData.planoId) {
      setFormData(prev => ({ ...prev, planoId }));
    }
  }, [planoId, formData.planoId]);

  useEffect(() => {
    if (planoId) {
      carregarDisciplinasDoPlanoDisciplinas(planoId);
    }
  }, [planoId]);

  if (loading || (planoId ? false : loadingPlanos)) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={`${styles.container} ${id ? styles.editMode : ''}`}>
      {showTextEditor && (
        <div className={styles.modalOverlay}>
          <div className={styles.textEditorModal}>
            <div className={styles.textEditorHeader}>
              <h3>Editor de Texto - Comandos</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowTextEditor(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.textEditorContent}>
              <ReactQuill
                value={editorContent}
                onChange={setEditorContent}
                modules={modules}
                formats={formats}
                placeholder="Digite as instruções ou comandos aqui..."
                id="textEditorArea"
              />
            </div>
            <div className={styles.textEditorFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowTextEditor(false)}
              >
                Cancelar
              </button>
              <button 
                className={styles.saveButton}
                onClick={saveTextEditorContent}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <h1>{id ? 'Editar Sprint' : 'Nova Sprint'}</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Seletor de plano de estudo */}
        {!planoId && (
          <div className={styles.formGroup}>
            <label htmlFor="planoId">Plano de Estudo</label>
            <select
              id="planoId"
              name="planoId"
              value={formData.planoId}
              onChange={handleChange}
              required
              className={styles.selectField}
            >
              <option value="">Selecione um plano de estudo</option>
              {planos.map(plano => (
                <option key={plano.id} value={plano.id}>
                  {plano.nome} - {plano.cargo}
                </option>
              ))}
            </select>
            <p className={styles.fieldHelp}>
              * Selecione o plano de estudo que esta sprint irá seguir
            </p>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="title">Nome da Sprint</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="startDate">Data de Início</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
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
              style={{ width: '100%', boxSizing: 'border-box' }}
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

              <div className={styles.activityContent}>
                <div className={styles.activityRow}>
                  <div className={styles.formGroup}>
                    <label>Disciplina</label>
                    <select
                      value={activity.discipline}
                      onChange={(e) => handleActivityChange(index, 'discipline', e.target.value)}
                      required
                      disabled={loadingDisciplinas || !formData.planoId}
                    >
                      <option value="">Selecione uma disciplina</option>
                      {getDisciplinasDisponiveis().map(discipline => (
                        <option key={discipline} value={discipline}>
                          {discipline}
                        </option>
                      ))}
                      <option value="custom">Outra</option>
                    </select>
                    {!formData.planoId ? (
                      <p className={styles.fieldHelp}>
                        Selecione um plano de estudo primeiro
                      </p>
                    ) : loadingDisciplinas ? (
                      <p className={styles.fieldHelp}>Carregando disciplinas do plano...</p>
                    ) : disciplinasDoPlanoDisciplinas.length > 0 ? (
                      <p className={styles.fieldHelp}>
                        {disciplinasDoPlanoDisciplinas.length} disciplina(s) disponíveis neste plano
                      </p>
                    ) : (
                      <p className={styles.fieldHelp}>
                        Nenhuma disciplina encontrada para este plano
                      </p>
                    )}
                  </div>

                  {activity.discipline === 'custom' && (
                    <div className={styles.formGroup}>
                      <label>Nome da Disciplina</label>
                      <input
                        type="text"
                        value={activity.customDiscipline}
                        onChange={(e) => handleActivityChange(index, 'customDiscipline', e.target.value)}
                        required
                        className={styles.customDisciplineField}
                      />
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label>Título da Meta</label>
                    <div className={styles.inputWithDropdown}>
                      <input
                        type="text"
                        value={activity.title}
                        onChange={(e) => handleActivityChange(index, 'title', e.target.value)}
                        required
                      />
                      {temAssuntosDisponiveis(activity.discipline) && (
                        <button
                          type="button"
                          className={styles.assuntosButton}
                          onClick={() => toggleAssuntosDropdown(index)}
                          title="Selecionar um assunto como título"
                        >
                          <span>▼</span>
                        </button>
                      )}
                      {showAssuntosDropdown[index] && temAssuntosDisponiveis(activity.discipline) && (
                        <div className={styles.assuntosDropdown}>
                          <div className={styles.assuntosHeader}>
                            <span>Selecione um assunto:</span>
                            <button 
                              type="button" 
                              onClick={() => toggleAssuntosDropdown(index)}
                              className={styles.closeDropdownButton}
                            >
                              ×
                            </button>
                          </div>
                          <ul>
                            {assuntosDaDisciplina[activity.discipline].map((assunto, assuntoIndex) => (
                              <li 
                                key={assuntoIndex} 
                                onClick={() => selecionarAssuntoComoTitulo(index, assunto.nome)}
                              >
                                {assunto.nome}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {temAssuntosDisponiveis(activity.discipline) && (
                      <p className={styles.fieldHelp}>
                        Clique na seta para selecionar um assunto como título
                      </p>
                    )}
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
                </div>

                <div className={styles.activityRow}>
                  <div className={styles.formGroup}>
                    <label>Comandos</label>
                    <div 
                      className={styles.commandsField}
                      onClick={() => openTextEditor(index, activity.comandos)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                      {activity.comandos ? 
                        <div 
                          className={styles.commandsPreview}
                          dangerouslySetInnerHTML={{ __html: activity.comandos }}
                        /> : 
                        <div className={styles.commandsPlaceholder}>
                          Clique para adicionar instruções ou comandos específicos
                        </div>
                      }
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Link</label>
                    <input
                      type="url"
                      value={activity.link}
                      onChange={(e) => handleActivityChange(index, 'link', e.target.value)}
                      placeholder="URL de referência (opcional)"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Relevância</label>
                    <div className={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`${styles.starButton} ${activity.relevance >= star ? styles.active : ''}`}
                          onClick={() => handleActivityChange(index, 'relevance', star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addActivity}
            className={styles.addButton}
            disabled={!formData.planoId}
          >
            + Adicionar Meta
          </button>
          {!formData.planoId && (
            <p className={styles.fieldHelp}>
              Selecione um plano de estudo para adicionar metas
            </p>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            {id ? 'Salvar Alterações' : 'Cadastrar Sprint'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/sprints')}
            className={styles.listButton}
          >
            Listar Sprints
          </button>
          {id && (
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Tem certeza que deseja excluir esta sprint?')) {
                  try {
                    await sprintService.excluirSprint(id);
                    alert('Sprint excluída com sucesso!');
                    navigate('/sprints');
                  } catch (error) {
                    console.error('Erro:', error);
                    alert('Erro ao excluir sprint. Tente novamente.');
                  }
                }
              }}
              className={styles.deleteButton}
            >
              Excluir Sprint
            </button>
          )}
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
};

export default RegisterSprint; 