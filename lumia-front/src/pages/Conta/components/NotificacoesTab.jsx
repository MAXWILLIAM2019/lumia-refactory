import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const NotificacoesTab = () => {
  const [notificacoes, setNotificacoes] = useState({
    novidadesPlataforma: true,
    mensagensMentor: true,
    novoMaterial: true,
    atividadesSimulados: false,
    mentorias: false
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/me');
        const notificacoesUsuario = response.data.aluno?.notificacoes;
        
        if (notificacoesUsuario) {
          setNotificacoes({
            novidadesPlataforma: notificacoesUsuario.novidadesPlataforma ?? true,
            mensagensMentor: notificacoesUsuario.mensagensMentor ?? true,
            novoMaterial: notificacoesUsuario.novoMaterial ?? true,
            atividadesSimulados: notificacoesUsuario.atividadesSimulados ?? false,
            mentorias: notificacoesUsuario.mentorias ?? false
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        setMessage('Erro ao carregar configurações de notificação');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Buscar ID do usuário logado
      const response = await api.get('/auth/me');
      const userId = response.data.aluno?.id || response.data.usuario?.IdUsuario;
      
      if (!userId) {
        throw new Error('ID do usuário não encontrado');
      }

      // Salvar configurações de notificação
      await api.put(`/alunos/${userId}/notificacoes`, {
        notificacoes: notificacoes
      });
      
      setMessage('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      
      // Tratar erros específicos da API
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.message) {
        setMessage(error.message);
      } else {
        setMessage('Erro ao salvar configurações. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // Recarregar dados do servidor
      const response = await api.get('/auth/me');
      const notificacoesUsuario = response.data.aluno?.notificacoes;
      
      if (notificacoesUsuario) {
        setNotificacoes({
          novidadesPlataforma: notificacoesUsuario.novidadesPlataforma ?? true,
          mensagensMentor: notificacoesUsuario.mensagensMentor ?? true,
          novoMaterial: notificacoesUsuario.novoMaterial ?? true,
          atividadesSimulados: notificacoesUsuario.atividadesSimulados ?? false,
          mentorias: notificacoesUsuario.mentorias ?? false
        });
      }
    } catch (error) {
      console.error('Erro ao recarregar configurações:', error);
      setMessage('Erro ao recarregar configurações');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto carrega os dados
  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2 style={{ 
          color: '#f9fafb', 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '24px',
          borderBottom: '2px solid #374151',
          paddingBottom: '12px'
        }}>
          Notificações
        </h2>
        <div style={{ 
          color: '#9ca3af', 
          fontSize: '16px',
          padding: '40px 0'
        }}>
          Carregando configurações...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ 
        color: '#f9fafb', 
        fontSize: '24px', 
        fontWeight: '600', 
        marginBottom: '24px',
        borderBottom: '2px solid #374151',
        paddingBottom: '12px'
      }}>
        Notificações
      </h2>

      <p style={{ 
        color: '#9ca3af', 
        fontSize: '16px', 
        marginBottom: '32px' 
      }}>
        Gerencie como e quando deseja receber avisos da plataforma.
      </p>

      {/* Novidades da plataforma */}
      <div style={{ 
        marginBottom: '24px', 
        paddingBottom: '24px', 
        borderBottom: '1px solid #374151' 
      }}>
        <h3 style={{ 
          color: '#f9fafb', 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '8px' 
        }}>
          Novidades da plataforma
        </h3>
        <p style={{ 
          color: '#d1d5db', 
          fontSize: '14px', 
          marginBottom: '16px' 
        }}>
          Receba informações sobre atualizações, novas funcionalidades e melhorias.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setNotificacoes(prev => ({ ...prev, novidadesPlataforma: true }))}
            style={{
              padding: '8px 16px',
              backgroundColor: notificacoes.novidadesPlataforma ? '#3b82f6' : '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: notificacoes.novidadesPlataforma ? '#ffffff' : '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => setNotificacoes(prev => ({ ...prev, novidadesPlataforma: false }))}
            style={{
              padding: '8px 16px',
              backgroundColor: !notificacoes.novidadesPlataforma ? '#3b82f6' : '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: !notificacoes.novidadesPlataforma ? '#ffffff' : '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Não
          </button>
        </div>
      </div>

      {/* Mensagens do mentor */}
      <div style={{ 
        marginBottom: '24px', 
        paddingBottom: '24px', 
        borderBottom: '1px solid #374151' 
      }}>
        <h3 style={{ 
          color: '#f9fafb', 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '8px' 
        }}>
          Mensagens do mentor
        </h3>
        <p style={{ 
          color: '#d1d5db', 
          fontSize: '14px', 
          marginBottom: '16px' 
        }}>
          Seja notificado quando seu mentor enviar mensagens diretas.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setNotificacoes(prev => ({ ...prev, mensagensMentor: true }))}
            style={{
              padding: '8px 16px',
              backgroundColor: notificacoes.mensagensMentor ? '#3b82f6' : '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: notificacoes.mensagensMentor ? '#ffffff' : '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => setNotificacoes(prev => ({ ...prev, mensagensMentor: false }))}
            style={{
              padding: '8px 16px',
              backgroundColor: !notificacoes.mensagensMentor ? '#3b82f6' : '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: !notificacoes.mensagensMentor ? '#ffffff' : '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Não
          </button>
        </div>
      </div>

      {/* Novo material publicado */}
      <div style={{ 
        marginBottom: '24px', 
        paddingBottom: '24px', 
        borderBottom: '1px solid #374151' 
      }}>
        <h3 style={{ 
          color: '#f9fafb', 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '8px' 
        }}>
          Novo material publicado
        </h3>
        <p style={{ 
          color: '#d1d5db', 
          fontSize: '14px', 
          marginBottom: '16px' 
        }}>
          Seja notificado quando novos materiais forem publicados para você.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setNotificacoes(prev => ({ ...prev, novoMaterial: true }))}
            style={{
              padding: '8px 16px',
              backgroundColor: notificacoes.novoMaterial ? '#3b82f6' : '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: notificacoes.novoMaterial ? '#ffffff' : '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => setNotificacoes(prev => ({ ...prev, novoMaterial: false }))}
            style={{
              padding: '8px 16px',
              backgroundColor: !notificacoes.novoMaterial ? '#3b82f6' : '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: !notificacoes.novoMaterial ? '#ffffff' : '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Não
          </button>
        </div>
      </div>

      {/* Atividades e simulados */}
      <div style={{ 
        marginBottom: '24px', 
        paddingBottom: '24px', 
        borderBottom: '1px solid #374151' 
      }}>
        <h3 style={{ 
          color: '#f9fafb', 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '8px' 
        }}>
          Atividades e simulados
        </h3>
        <p style={{ 
          color: '#d1d5db', 
          fontSize: '14px', 
          marginBottom: '16px' 
        }}>
          Seja notificado sobre novos simulados, questões ou exercícios disponíveis.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setNotificacoes(prev => ({ ...prev, atividadesSimulados: true }))}
            style={{
              padding: '8px 16px',
              backgroundColor: notificacoes.atividadesSimulados ? '#3b82f6' : '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: notificacoes.atividadesSimulados ? '#ffffff' : '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => setNotificacoes(prev => ({ ...prev, atividadesSimulados: false }))}
            style={{
              padding: '8px 16px',
              backgroundColor: !notificacoes.atividadesSimulados ? '#3b82f6' : '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: !notificacoes.atividadesSimulados ? '#ffffff' : '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Não
          </button>
        </div>
      </div>

      {/* Mentorias */}
      <div style={{ 
        marginBottom: '32px', 
        paddingBottom: '24px', 
        borderBottom: '1px solid #374151' 
      }}>
        <h3 style={{ 
          color: '#f9fafb', 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '8px' 
        }}>
          Mentorias
        </h3>
        <p style={{ 
          color: '#d1d5db', 
          fontSize: '14px', 
          marginBottom: '16px' 
        }}>
          Seja notificado quando a data de uma mentoria agendada estiver próxima.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setNotificacoes(prev => ({ ...prev, mentorias: true }))}
            style={{
              padding: '8px 16px',
              backgroundColor: notificacoes.mentorias ? '#3b82f6' : '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: notificacoes.mentorias ? '#ffffff' : '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => setNotificacoes(prev => ({ ...prev, mentorias: false }))}
            style={{
              padding: '8px 16px',
              backgroundColor: !notificacoes.mentorias ? '#3b82f6' : '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: !notificacoes.mentorias ? '#ffffff' : '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Não
          </button>
        </div>
      </div>

      {message && (
        <div style={{ 
          marginBottom: '24px',
          padding: '12px 16px',
          backgroundColor: message.includes('sucesso') ? '#065f46' : '#7f1d1d',
          border: `1px solid ${message.includes('sucesso') ? '#10b981' : '#ef4444'}`,
          borderRadius: '8px',
          color: '#f9fafb',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        justifyContent: 'flex-end' 
      }}>
        <button
          onClick={handleCancel}
          disabled={saving}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#d1d5db',
            fontSize: '16px',
            fontWeight: '500',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.5 : 1
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 24px',
            backgroundColor: saving ? '#6b7280' : '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '500',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </div>
    </div>
  );
};

export default NotificacoesTab;