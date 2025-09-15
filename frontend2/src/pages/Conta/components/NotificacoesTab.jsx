import React, { useState } from 'react';

const NotificacoesTab = () => {
  const [notificacoes, setNotificacoes] = useState({
    emailSprint: true,
    emailAtividades: true,
    emailLembretes: false,
    pushNotificacoes: true,
    smsLembretes: false
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, checked } = e.target;
    setNotificacoes(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // TODO: Implementar chamada para API de configurações de notificação
      console.log('Salvando configurações de notificação...', notificacoes);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMessage('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Resetar para valores padrão
    setNotificacoes({
      emailSprint: true,
      emailAtividades: true,
      emailLembretes: false,
      pushNotificacoes: true,
      smsLembretes: false
    });
    setMessage('');
  };

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

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          color: '#e5e7eb', 
          fontSize: '18px', 
          fontWeight: '500', 
          marginBottom: '16px' 
        }}>
          E-mail
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#d1d5db', 
            fontSize: '14px', 
            fontWeight: '500', 
            cursor: 'pointer' 
          }}>
            <input
              type="checkbox"
              name="emailSprint"
              checked={notificacoes.emailSprint}
              onChange={handleInputChange}
              style={{
                marginRight: '12px',
                width: '18px',
                height: '18px',
                accentColor: '#3b82f6'
              }}
            />
            Notificações sobre sprints
          </label>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#d1d5db', 
            fontSize: '14px', 
            fontWeight: '500', 
            cursor: 'pointer' 
          }}>
            <input
              type="checkbox"
              name="emailAtividades"
              checked={notificacoes.emailAtividades}
              onChange={handleInputChange}
              style={{
                marginRight: '12px',
                width: '18px',
                height: '18px',
                accentColor: '#3b82f6'
              }}
            />
            Notificações sobre atividades
          </label>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#d1d5db', 
            fontSize: '14px', 
            fontWeight: '500', 
            cursor: 'pointer' 
          }}>
            <input
              type="checkbox"
              name="emailLembretes"
              checked={notificacoes.emailLembretes}
              onChange={handleInputChange}
              style={{
                marginRight: '12px',
                width: '18px',
                height: '18px',
                accentColor: '#3b82f6'
              }}
            />
            Lembretes por e-mail
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          color: '#e5e7eb', 
          fontSize: '18px', 
          fontWeight: '500', 
          marginBottom: '16px' 
        }}>
          Push
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#d1d5db', 
            fontSize: '14px', 
            fontWeight: '500', 
            cursor: 'pointer' 
          }}>
            <input
              type="checkbox"
              name="pushNotificacoes"
              checked={notificacoes.pushNotificacoes}
              onChange={handleInputChange}
              style={{
                marginRight: '12px',
                width: '18px',
                height: '18px',
                accentColor: '#3b82f6'
              }}
            />
            Notificações push
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          color: '#e5e7eb', 
          fontSize: '18px', 
          fontWeight: '500', 
          marginBottom: '16px' 
        }}>
          SMS
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#d1d5db', 
            fontSize: '14px', 
            fontWeight: '500', 
            cursor: 'pointer' 
          }}>
            <input
              type="checkbox"
              name="smsLembretes"
              checked={notificacoes.smsLembretes}
              onChange={handleInputChange}
              style={{
                marginRight: '12px',
                width: '18px',
                height: '18px',
                accentColor: '#3b82f6'
              }}
            />
            Lembretes por SMS
          </label>
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
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
};

export default NotificacoesTab;

