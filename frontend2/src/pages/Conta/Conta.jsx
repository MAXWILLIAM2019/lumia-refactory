import React from 'react';
import { useUsuarioData } from './hooks/useUsuarioData';
import { useTabNavigation } from './hooks/useTabNavigation';
import DadosPerfilTab from './components/DadosPerfilTab';
import AlterarSenhaTab from './components/AlterarSenhaTab';
import NotificacoesTab from './components/NotificacoesTab';
import BagagemConteudoTab from './components/BagagemConteudoTab';

const Conta = () => {
  const { 
    usuario, 
    formData, 
    loading, 
    saving, 
    message, 
    handleSave, 
    handleCancel, 
    handleInputChange 
  } = useUsuarioData();

  const { activeTab, tabs, handleTabChange } = useTabNavigation();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dados-perfil':
        return (
          <DadosPerfilTab
            formData={formData}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            handleCancel={handleCancel}
            saving={saving}
            message={message}
          />
        );
      case 'alterar-senha':
        return <AlterarSenhaTab />;
      case 'notificacoes':
        return <NotificacoesTab />;
      case 'bagagem-conteudo':
        return <BagagemConteudoTab />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#10131a'
      }}>
        <div style={{
          color: '#f9fafb',
          fontSize: '18px',
          fontWeight: '500'
        }}>
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#10131a',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#10131a'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: '#f9fafb',
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            Minha Conta
          </h1>
          <p style={{
            color: '#9ca3af',
            fontSize: '16px'
          }}>
            Gerencie suas informações pessoais e configurações
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #374151',
          marginBottom: '0',
          backgroundColor: '#1f2937'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                padding: '16px 24px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#9ca3af',
                fontSize: '16px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.color = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.color = '#9ca3af';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: '0 0 12px 12px',
          minHeight: '600px'
        }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Conta;

