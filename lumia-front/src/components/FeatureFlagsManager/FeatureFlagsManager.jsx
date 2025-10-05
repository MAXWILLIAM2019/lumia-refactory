import { useState, useEffect } from 'react';
import { FEATURE_FLAGS, getAllFeatureFlags, setFeatureFlag, resetFeatureFlags } from '../../config/feature-flags';
import { setUseNewEndpoints } from '../../services/api-endpoints';
import styles from './FeatureFlagsManager.module.css';

/**
 * Componente para gerenciar feature flags
 * 
 * Este componente permite visualizar e modificar as feature flags do sistema.
 * É útil para testes e desenvolvimento, e pode ser acessado apenas por administradores.
 */
export default function FeatureFlagsManager() {
  const [flags, setFlags] = useState(getAllFeatureFlags());
  const [isVisible, setIsVisible] = useState(false);

  // Atualiza as flags quando elas mudam
  useEffect(() => {
    const handleFlagChange = () => {
      setFlags(getAllFeatureFlags());
    };

    window.addEventListener('featureFlagChanged', handleFlagChange);
    window.addEventListener('featureFlagsReset', handleFlagChange);

    return () => {
      window.removeEventListener('featureFlagChanged', handleFlagChange);
      window.removeEventListener('featureFlagsReset', handleFlagChange);
    };
  }, []);

  // Atualiza a configuração de endpoints quando a flag muda
  useEffect(() => {
    setUseNewEndpoints(flags[FEATURE_FLAGS.USE_NEW_ENDPOINTS]);
  }, [flags]);

  // Alterna a visibilidade do painel
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Alterna o valor de uma flag
  const toggleFlag = (flagName) => {
    setFeatureFlag(flagName, !flags[flagName]);
  };

  // Reset todas as flags
  const handleReset = () => {
    resetFeatureFlags();
  };

  return (
    <div className={styles.container}>
      {/* Botão flutuante para abrir o painel */}
      <button 
        className={styles.toggleButton} 
        onClick={toggleVisibility}
        title="Gerenciar Feature Flags"
      >
        🚩
      </button>

      {/* Painel de feature flags */}
      {isVisible && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <h3>Feature Flags</h3>
            <button 
              className={styles.closeButton} 
              onClick={toggleVisibility}
              title="Fechar"
            >
              ×
            </button>
          </div>

          <div className={styles.flagsList}>
            {Object.entries(flags).map(([flagName, value]) => (
              <div key={flagName} className={styles.flagItem}>
                <label className={styles.flagLabel}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleFlag(flagName)}
                    className={styles.flagCheckbox}
                  />
                  <span className={styles.flagName}>{flagName}</span>
                </label>
                <span className={`${styles.flagStatus} ${value ? styles.active : styles.inactive}`}>
                  {value ? 'ON' : 'OFF'}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <button 
              className={styles.resetButton} 
              onClick={handleReset}
              title="Resetar todas as flags"
            >
              Resetar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
