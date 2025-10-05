/**
 * Componente de Verificação de Autenticação
 * 
 * Este componente verifica o status de autenticação e fornece
 * informações para depuração. Deve ser usado apenas em ambientes de desenvolvimento.
 */
import { useState, useEffect } from 'react';
import authService from '../../services/authService';
import styles from './AuthCheck.module.css';

const AuthCheck = () => {
  const [authInfo, setAuthInfo] = useState({
    hasToken: false,
    tokenValue: '',
    isValid: null,
    serverResponse: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setAuthInfo(prev => ({ ...prev, loading: true, error: null }));
      
      // Verificar se existe um token
      const token = authService.getToken();
      
      // Sanitizar o token para exibição
      const sanitizedToken = token 
        ? `${token.substring(0, 10)}...${token.substring(token.length - 5)}` 
        : '';
      
      // Atualizar o estado com informações do token
      setAuthInfo(prev => ({
        ...prev,
        hasToken: !!token,
        tokenValue: sanitizedToken
      }));
      
      // Se não houver token, não continue a validação
      if (!token) {
        return setAuthInfo(prev => ({ 
          ...prev, 
          loading: false,
          isValid: false,
          serverResponse: null
        }));
      }
      
      // Validar o token com o servidor
      const isValid = await authService.validateToken();
      
      // Atualizar o estado com o resultado da validação
      setAuthInfo(prev => ({ 
        ...prev, 
        isValid, 
        loading: false,
        serverResponse: { valid: isValid }
      }));
    } catch (error) {
      console.error('Erro durante verificação de autenticação:', error);
      setAuthInfo(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Erro na verificação de autenticação'
      }));
    }
  };

  return (
    <div className={styles.container}>
      <h3>Status de Autenticação</h3>
      
      {authInfo.loading ? (
        <p>Verificando autenticação...</p>
      ) : (
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <strong>Token Local:</strong>
            <span className={authInfo.hasToken ? styles.success : styles.error}>
              {authInfo.hasToken ? 'Presente' : 'Ausente'}
            </span>
          </div>
          
          {authInfo.hasToken && (
            <div className={styles.infoRow}>
              <strong>Token (truncado):</strong>
              <span className={styles.tokenValue}>{authInfo.tokenValue}</span>
            </div>
          )}
          
          <div className={styles.infoRow}>
            <strong>Validação no Servidor:</strong>
            {authInfo.isValid === null ? (
              <span className={styles.warning}>Não verificado</span>
            ) : authInfo.isValid ? (
              <span className={styles.success}>Válido</span>
            ) : (
              <span className={styles.error}>Inválido</span>
            )}
          </div>
          
          {authInfo.error && (
            <div className={styles.infoRow}>
              <strong>Erro:</strong>
              <span className={styles.error}>{authInfo.error}</span>
            </div>
          )}
        </div>
      )}
      
      <button 
        onClick={checkAuthStatus} 
        className={styles.refreshButton}
        disabled={authInfo.loading}
      >
        {authInfo.loading ? 'Verificando...' : 'Verificar Novamente'}
      </button>
    </div>
  );
};

export default AuthCheck; 