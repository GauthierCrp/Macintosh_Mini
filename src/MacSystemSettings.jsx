import React, { useState, useEffect, useRef } from 'react';

const ACTIONS = [
  { id: 'bright_20',  label: 'Luminosité 20%',  type: 'brightness', value: 20 },
  { id: 'bright_50',  label: 'Luminosité 50%',  type: 'brightness', value: 50 },
  { id: 'bright_70',  label: 'Luminosité 70%',  type: 'brightness', value: 70 },
  { id: 'bright_100', label: 'Luminosité 100%', type: 'brightness', value: 100 },
  { id: 'exit_surf',  label: 'Quitter Surf ✕',  type: 'system',     value: 'kill_surf' },
  { id: 'reboot',     label: 'Redémarrer',      type: 'system',     value: 'reboot' },
  { id: 'shutdown',   label: 'Éteindre',       type: 'system',     value: 'shutdown' }
];

const SCAN_INTERVAL = 2000;
const BACKEND_URL = 'http://localhost:5000/api/system';

export default function MacSystemSettings() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const activeIndexRef = useRef(activeIndex);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % ACTIONS.length);
    }, SCAN_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      e.preventDefault();
      const currentAction = ACTIONS[activeIndexRef.current];
      triggerBackendAction(currentAction);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
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
        <div style={styles.titleBar}>
          <div style={styles.closeBox}></div>
          <div style={styles.titleText}>Options Système</div>
        </div>
        <div style={styles.content}>
          {ACTIONS.map((action, index) => {
            const isSelected = index === activeIndex;
            return (
              <div
                key={action.id}
                style={{
                  ...styles.button,
                  ...(isSelected ? styles.buttonSelected : {})
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
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#555',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'monospace',
    userSelect: 'none',
    cursor: 'none',
    overflow: 'hidden',
    boxSizing: 'border-box'
  },
  window: {
    width: '280px',
    backgroundColor: '#fff',
    border: '2px solid #000',
    boxShadow: '4px 4px 0px #000',
    display: 'flex',
    flexDirection: 'column'
  },
  titleBar: {
    backgroundColor: '#fff',
    borderBottom: '2px solid #000',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 6px',
    position: 'relative'
  },
  closeBox: {
    width: '12px',
    height: '12px',
    border: '2px solid #000',
    backgroundColor: '#fff'
  },
  titleText: {
    flex: 1,
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  content: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  button: {
    padding: '8px 12px',
    border: '1px solid #000',
    backgroundColor: '#fff',
    color: '#000',
    fontSize: '13px',
    fontWeight: 'bold',
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  buttonSelected: {
    backgroundColor: '#000',
    color: '#fff'
  },
  indicator: {
    fontSize: '10px'
  },
  statusBar: {
    borderTop: '1px dashed #000',
    padding: '6px',
    fontSize: '11px',
    textAlign: 'center',
    backgroundColor: '#eee',
    color: '#000'
  }
};