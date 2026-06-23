import React, { useState, useEffect, useRef } from 'react';

const ACTIONS = [
  { id: 'bright_20',  label: '🔆 LUMINOSITÉ 20%',  type: 'brightness', value: 20 },
  { id: 'bright_50',  label: '🔆 LUMINOSITÉ 50%',  type: 'brightness', value: 50 },
  { id: 'bright_70',  label: '🔆 LUMINOSITÉ 70%',  type: 'brightness', value: 70 },
  { id: 'bright_100', label: '🔆 LUMINOSITÉ 100%', type: 'brightness', value: 100 },
  { id: 'exit_surf',  label: '✕ QUITTER SURF',     type: 'system',     value: 'kill_surf' },
  { id: 'reboot',     label: '🔄 REDÉMARRER',      type: 'system',     value: 'reboot' },
  { id: 'shutdown',   label: '🛑 ÉTEINDRE',        type: 'system',     value: 'shutdown' },
  { id: 'back_config', label: '« RETOUR CONFIGURATION', type: 'nav',    value: 'config' }
];

const SCAN_INTERVAL = 1200;
const BACKEND_URL = 'http://localhost:5000/api/system';

export default function MacSystemSettings() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const activeIndexRef = useRef(activeIndex);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Horloge de scan
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % ACTIONS.length);
    }, SCAN_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // Interception de la validation unifiée
  useEffect(() => {
    const handleGlobalSelect = (e) => {
      if (e) e.preventDefault();
      const currentAction = ACTIONS[activeIndexRef.current];
      
      if (currentAction.id === 'back_config') {
        window.dispatchEvent(new CustomEvent('mac_switch_view', { detail: 'settings' }));
      } else {
        triggerBackendAction(currentAction);
      }
    };
    
    window.addEventListener('mac_trigger_select', handleGlobalSelect);
    return () => window.removeEventListener('mac_trigger_select', handleGlobalSelect);
  }, []);

  const triggerBackendAction = async (action) => {
    setStatusMessage(`Exécution : ${action.label}...`);
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: action.type, value: action.value })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setStatusMessage(`Succès : ${action.label}`);
      } else {
        setStatusMessage(`Erreur : ${data.message || 'Serveur'}`);
      }
    } catch (error) {
      setStatusMessage('Erreur de connexion');
      console.error(error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.window}>
        {/* Barre de titre Mac OS authentique */}
        <div style={styles.titleBar}>
          <div style={styles.closeBox} onClick={() => window.dispatchEvent(new CustomEvent('mac_switch_view', { detail: 'settings' }))} />
          <div style={styles.titleLines} />
          <div style={styles.titleText}>Options Système</div>
          <div style={styles.titleLines} />
        </div>

        <div style={styles.content}>
          {ACTIONS.map((action, index) => {
            const isSelected = index === activeIndex;
            const isNav = action.id === 'back_config';
            return (
              <div
                key={action.id}
                style={{
                  ...styles.button,
                  ...(isSelected ? styles.buttonSelected : {}),
                  marginTop: isNav ? 'auto' : '0px',
                  borderBottom: isNav ? '2px double #000' : '1px solid #000',
                  fontWeight: isNav ? '900' : 'bold'
                }}
              >
                {action.label}
                {isSelected && <span style={styles.indicator}> ◄</span>}
              </div>
            );
          })}
        </div>
        
        {statusMessage && (
          <div style={styles.statusBar}>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { width: '100vw', height: '100vh', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: '"Courier New", monospace', imageRendering: 'pixelated', userSelect: 'none', cursor: 'none', overflow: 'hidden', boxSizing: 'border-box' },
  window: { width: '340px', height: '400px', backgroundColor: '#fff', border: '2px solid #000', boxShadow: '5px 5px 0px #000', display: 'flex', flexDirection: 'column' },
  titleBar: { backgroundColor: '#fff', borderBottom: '2px solid #000', height: '28px', display: 'flex', alignItems: 'center', padding: '0 8px', position: 'relative' },
  closeBox: { width: '12px', height: '12px', border: '2px solid #000', backgroundColor: '#fff', cursor: 'pointer' },
  titleLines: { flexGrow: 1, height: '6px', borderTop: '1px solid #000', borderBottom: '1px solid #000', margin: '0 6px' },
  titleText: { textAlign: 'center', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px', padding: '0 4px' },
  content: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '5px', flexGrow: 1 },
  button: { padding: '7px 10px', border: '1px solid #000', backgroundColor: '#fff', color: '#000', fontSize: '11px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '1px' },
  buttonSelected: { backgroundColor: '#000', color: '#fff' },
  indicator: { fontSize: '10px' },
  statusBar: { borderTop: '1px dashed #000', padding: '6px', fontSize: '10px', textAlign: 'center', backgroundColor: '#eee', color: '#000', fontWeight: 'bold' }
};