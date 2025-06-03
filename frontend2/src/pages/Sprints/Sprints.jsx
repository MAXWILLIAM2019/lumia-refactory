/**
 * Implementação de Drag and Drop para reordenação de Sprints
 * 
 * Este componente utiliza a biblioteca @dnd-kit para implementar a funcionalidade
 * de arrastar e soltar (drag and drop) para reordenar sprints.
 * 
 * Nota: Anteriormente foi tentada uma implementação com react-beautiful-dnd,
 * mas houve problemas de compatibilidade. A biblioteca @dnd-kit é mais moderna
 * e tem melhor suporte para versões recentes do React.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import styles from './Sprints.module.css';
import { sprintService } from '../../services/sprintService';

/**
 * Componente de Item Sortable (Arrastável)
 * Este componente usa o hook useSortable da biblioteca @dnd-kit para
 * permitir que cada sprint seja arrastada e reordenada.
 * 
 * @param {Object} sprint - Objeto contendo dados da sprint
 * @param {number} index - Índice do item na lista
 */
function SortableItem({ sprint, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: sprint.id,
    disabled: sprint.status !== 'Pendente' // Corrigido para usar 'Pendente' com P maiúsculo
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '16px',
    margin: '0 0 8px 0',
    backgroundColor: sprint.status !== 'Pendente' ? '#f3f4f6' : 'white',
    color: sprint.status !== 'Pendente' ? '#9ca3af' : '#1f2937',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    zIndex: isDragging ? 999 : 0,
    opacity: sprint.status !== 'Pendente' ? 0.7 : 1,
    cursor: sprint.status !== 'Pendente' ? 'not-allowed' : 'default'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Alça de arrasto - só aparece se a sprint estiver pendente */}
        {sprint.status === 'Pendente' && (
          <div
            style={{
              marginRight: '10px',
              color: '#9ca3af',
              fontSize: '20px',
              cursor: 'grab',
            }}
            {...listeners}
          >
            ⠿
          </div>
        )}
        {/* Número indicador da posição */}
        <div style={{ 
          marginRight: '10px', 
          backgroundColor: sprint.status === 'Pendente' ? '#3b82f6' : '#9ca3af', 
          color: 'white', 
          width: '24px', 
          height: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          borderRadius: '50%', 
          fontSize: '12px', 
          fontWeight: 'bold' 
        }}>
          {index + 1}
        </div>
        {/* Informações da sprint */}
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{sprint.nome}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {new Date(sprint.dataInicio).toLocaleDateString()} - {new Date(sprint.dataFim).toLocaleDateString()}
          </div>
          {/* Status badge */}
          <div style={{
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            marginTop: '4px',
            backgroundColor: 
              sprint.status === 'Pendente' ? '#fee2e2' :
              sprint.status === 'Em Andamento' ? '#fef3c7' :
              '#dcfce7',
            color: 
              sprint.status === 'Pendente' ? '#b91c1c' :
              sprint.status === 'Em Andamento' ? '#b45309' :
              '#166534'
          }}>
            {sprint.status}
          </div>
          {sprint.status !== 'Pendente' && (
            <div style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              Não é possível reordenar sprints {sprint.status === 'Em Andamento' ? 'em andamento' : 'concluídas'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Componente Sprints
 * Exibe a listagem de todas as sprints cadastradas
 */
export default function Sprints() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reordenandoPlanoId, setReordenandoPlanoId] = useState(null);
  const [salvandoOrdem, setSalvandoOrdem] = useState(false);
  const navigate = useNavigate();
  
  // Configuração dos sensores para detecção de arrastar e soltar
  // Permite tanto arrasto com mouse/touch quanto com teclado (acessibilidade)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSprints();
  }, []);

  /**
   * Busca todas as sprints do backend
   */
  const fetchSprints = async () => {
    try {
      setLoading(true);
      console.log('Buscando sprints...');
      const data = await sprintService.listarSprints();
      console.log('Sprints recebidas:', data);
      setSprints(Array.isArray(data) ? data : []);
      setError('');
    } catch (error) {
      console.error('Erro ao buscar sprints:', error);
      setError(error.message || 'Erro ao carregar sprints');
      setSprints([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Agrupa sprints por plano e preserva a ordem
   */
  const getSprintsByPlano = () => {
    const planos = {};
    
    sprints.forEach(sprint => {
      const planoId = sprint.PlanoId;
      const planoNome = sprint.Plano?.nome || 'Sem Plano';
      
      if (!planos[planoId]) {
        planos[planoId] = {
          id: planoId,
          nome: planoNome,
          sprints: []
        };
      }
      
      planos[planoId].sprints.push(sprint);
    });
    
    // Ordena sprints por posição em cada plano
    Object.values(planos).forEach(plano => {
      plano.sprints.sort((a, b) => a.posicao - b.posicao);
    });
    
    return Object.values(planos);
  };

  /**
   * Navega para a página de cadastro de sprint
   */
  const handleRegisterClick = () => {
    navigate('/sprints/cadastrar');
  };

  /**
   * Navega para a página de edição de sprint
   * @param {number} sprintId - ID da sprint a ser editada
   */
  const handleEditClick = (sprintId) => {
    navigate(`/sprints/editar/${sprintId}`);
  };

  /**
   * Ativa o modo de reordenação para um plano específico
   * @param {number} planoId - ID do plano a ser reordenado
   */
  const handleReordenarClick = (planoId) => {
    setReordenandoPlanoId(planoId);
  };

  /**
   * Cancela o modo de reordenação
   */
  const handleCancelarReordenacao = () => {
    setReordenandoPlanoId(null);
  };

  /**
   * Salva a nova ordem das sprints
   * @param {number} planoId - ID do plano
   * @param {Array} sprintsOriginais - Array com todas as sprints do plano
   * @param {Array} pendentesReordenadas - Array com as sprints pendentes reordenadas
   */
  const handleSalvarReordenacao = async (planoId, sprintsOriginais, pendentesReordenadas) => {
    try {
      setSalvandoOrdem(true);
      // Monta a lista completa de sprints, reordenando apenas as pendentes
      const pendentesFila = [...pendentesReordenadas];
      const ordemSprints = sprintsOriginais.map(sprint => {
        if (sprint.status === 'Pendente') {
          return pendentesFila.shift().id;
        }
        return sprint.id;
      });

      // (Validação extra removida - agora só no backend)

      console.log('Enviando ordem final:', ordemSprints);
      await sprintService.reordenarSprints(planoId, ordemSprints);
      await fetchSprints();
      setReordenandoPlanoId(null);
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
      if (error.response?.data?.sprintsBloqueadas) {
        const sprintsBloqueadas = error.response.data.sprintsBloqueadas;
        const mensagem = `Não é permitido alterar a posição das seguintes sprints já iniciadas ou concluídas:\n${sprintsBloqueadas.map(s => `- ${s.nome} (${s.status})`).join('\n')}`;
        alert(mensagem);
      } else {
        alert('Erro ao salvar a nova ordem. Tente novamente.');
      }
    } finally {
      setSalvandoOrdem(false);
    }
  };

  /**
   * Handler para quando um item é arrastado e solto
   * @param {Object} event - Evento de drag end da biblioteca @dnd-kit
   * @param {number} planoId - ID do plano sendo reordenado
   * @param {Array} planoSprints - Array das sprints do plano
   */
  const handleDragEnd = (event, planoId, planoSprints) => {
    const { active, over } = event;
    
    // Se não houver um elemento "over" (destino), não fazer nada
    if (!over) return;
    
    // Se o item ativo (arrastado) for diferente do item de destino (sobre)
    if (active.id !== over.id) {
      // Encontrar os índices no array
      const oldIndex = planoSprints.findIndex(sprint => sprint.id === active.id);
      const newIndex = planoSprints.findIndex(sprint => sprint.id === over.id);
      
      // Reordenar o array de sprints do plano usando a função arrayMove do @dnd-kit
      const newPlanoSprints = arrayMove(planoSprints, oldIndex, newIndex);
      
      // Atualizar posições (1-indexed)
      newPlanoSprints.forEach((sprint, index) => {
        sprint.posicao = index + 1;
      });
      
      // Atualizar sprints no estado React
      const newSprints = [...sprints];
      
      newSprints.forEach(sprint => {
        if (sprint.PlanoId === planoId) {
          const updatedSprint = newPlanoSprints.find(s => s.id === sprint.id);
          if (updatedSprint) {
            sprint.posicao = updatedSprint.posicao;
          }
        }
      });
      
      console.log('Sprints reordenadas (local):', newPlanoSprints.map(s => s.id));
      setSprints(newSprints);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Carregando sprints...</div>;
  }

  const planosList = getSprintsByPlano();

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

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={fetchSprints}>Tentar novamente</button>
        </div>
      )}

      {!error && sprints.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nenhuma sprint encontrada. Clique em "Nova Sprint" para criar.</p>
        </div>
      )}

      {planosList.map(plano => (
        <div key={plano.id} className={styles.planoSection}>
          <div className={styles.planoHeader}>
            <h2 className={styles.planoTitle}>
              {plano.nome}
            </h2>
            
            {reordenandoPlanoId === plano.id ? (
              <div className={styles.reordenarControles}>
                <button 
                  className={styles.salvarReordenacaoButton}
                  onClick={() => handleSalvarReordenacao(plano.id, plano.sprints, plano.sprints.filter(s => s.status === 'Pendente'))}
                  disabled={salvandoOrdem}
                >
                  {salvandoOrdem ? 'Salvando...' : 'Salvar ordem'}
                </button>
                <button 
                  className={styles.cancelarReordenacaoButton}
                  onClick={handleCancelarReordenacao}
                  disabled={salvandoOrdem}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              plano.sprints.length > 1 && (
                <button
                  className={styles.reordenarButton}
                  onClick={() => handleReordenarClick(plano.id)}
                >
                  Reordenar sprints
                </button>
              )
            )}
          </div>

          {reordenandoPlanoId === plano.id ? (
            <div className={styles.reordenacaoContainer}>
              {/* Contexto de Drag and Drop - gerencia toda a funcionalidade de arrastar e soltar */}
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, plano.id, plano.sprints)}
              >
                {/* Contexto para itens ordenáveis - mantém o estado da ordem */}
                <SortableContext 
                  items={plano.sprints.map(sprint => sprint.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className={styles.sortableList}>
                    {/* Renderizar cada sprint como um item arrastável */}
                    {plano.sprints.map((sprint, index) => (
                      <SortableItem key={sprint.id} sprint={sprint} index={index} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <div className={styles.sprintsList}>
              {plano.sprints.map((sprint, index) => (
                <div key={sprint.id} className={styles.sprintCard}>
                  <div className={styles.sequenceIndicator}>
                    {index + 1}
                  </div>
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
                    <h3>Metas</h3>
                    {sprint.metas && sprint.metas.length > 0 ? (
                      <ul>
                        {sprint.metas.map((meta) => (
                          <li key={meta.id} className={styles.activityItem}>
                            <div className={styles.activityInfo}>
                              <span className={styles.discipline}>{meta.disciplina}</span>
                              <span className={styles.title}>{meta.titulo}</span>
                            </div>
                            <div className={styles.activityDetails}>
                              <span className={styles.type}>{meta.tipo}</span>
                              <span className={styles.relevance}>
                                {'★'.repeat(meta.relevancia || 0)}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.noActivities}>Nenhuma meta cadastrada para esta sprint.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 