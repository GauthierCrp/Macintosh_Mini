import React, { useState, useEffect, useRef } from 'react';
import { CONFIG } from './config';

const MacSettings = ({ enabledApps, toggleApp, isAutoCycle, setIsAutoCycle }) => {
  // Ajout de 'systemSettings' dans la liste des options scannées
  const allKeys = ['autoCycle', 'paint', 'weather', 'clock', 'news', 'stats', 'playing', 'systemSettings'];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);

  const appLabels = {
    autoCycle: "🔄 BASCULEMENT AUTOMATIQUE (KIOSK MODE)",
    paint: "APPLE PAINT (DESSIN)",
    weather: "APPLE WEATHER (MÉTÉO)",
    clock: "APPLE CLOCK (HORLOGE)",
    news: "MACNEWS (TÉLÉSCRIPTEUR)",
    stats: "MACSTAT (MONITEUR SYSTÈME)",
    playing: "NOW PLAYING (MUSIQUE)",
    systemSettings: "⚙️ OPTIONS SYSTÈME (LUMINOSITÉ, ARRET...)" // Nouveau bouton
  };

  // Synchronisation du ref pour l'écouteur d'événement global
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // 1. Effet "Scanner" : Le curseur descend tout seul toutes les 2 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % allKeys.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 2. Interception du clic validé par App.jsx
  useEffect(() => {
    const handleSelect = () => {
      const currentKey = allKeys[activeIndexRef.current];
      
      if (currentKey === 'autoCycle') {
        setIsAutoCycle(prev => !prev);
      } else if (currentKey === 'systemSettings') {
        // Déclenche un événement personnalisé pour dire à App.jsx de changer de vue
        window.dispatchEvent(new CustomEvent('mac_switch_view', { detail: 'system_settings' }));
      } else {
        toggleApp(currentKey);
      }
    };

    window.addEventListener('mac_trigger_select', handleSelect);
    return () => window.removeEventListener('mac_trigger_select', handleSelect);
  }, [setIsAutoCycle, toggleApp]);

  return (
    <div style={styles.container}>
      <div style={styles.window}>
        <div style={styles.titleBar}>
          <div style={styles.closeBox} />
          <div style={styles.titleLinesLeft} />
          <span style={styles.windowTitle}>PANNEAU DE CONFIGURATION</span>
          <div style={styles.titleLinesRight} />
        </div>

        <div style={styles.content}>
          <span style={styles.sectionTitle}>CONFIGURATION DU SYSTEME :</span>
          
          <div style={styles.listContainer}>
            {allKeys.map((key, index) => {
              const isFocused = index === activeIndex;
              
              // Détermine si la ligne doit être cochée
              const isChecked = key === 'autoCycle' ? isAutoCycle : enabledApps[key];
              const isAppDisabled = key !== 'autoCycle' && key !== 'systemSettings' && !enabledApps[key];
              
              // Différenciation visuelle pour les boutons globaux de type commande / navigation
              const isNavButton = key === 'autoCycle' || key === 'systemSettings';

              return (
                <div 
                  key={key} 
                  style={{
                    ...styles.row,
                    backgroundColor: isFocused ? '#000' : '#fff',
                    color: isFocused ? '#fff' : '#000',
                    borderBottom: isNavButton ? '2px double #000' : '1px transparent solid',
                    marginBottom: key === 'autoCycle' ? '6px' : key === 'systemSettings' ? '0px' : '0px',
                    marginTop: key === 'systemSettings' ? 'auto' : '0px' // Pousse le bouton système vers le bas de la liste
                  }}
                >
                  {/* Case à cocher rétro (masquée pour le bouton de navigation système) */}
                  {key !== 'systemSettings' ? (
                    <div style={{
                      ...styles.checkbox,
                      borderColor: isFocused ? '#fff' : '#000',
                      backgroundColor: isFocused ? '#000' : '#fff'
                    }}>
                      {isChecked && (
                        <div style={{
                          ...styles.checked,
                          backgroundColor: isFocused ? '#fff' : '#000'
                        }} />
                      )}
                    </div>
                  ) : (
                    // Remplacement de la case à cocher par un espace vide ou icône pour le bouton de navigation
                    <div style={{ width: '14px', height: '14px' }} />
                  )}

                  <span style={{
                    ...styles.appLabel, 
                    textDecoration: isAppDisabled ? 'line-through' : 'none',
                    fontWeight: isNavButton ? '900' : 'bold'
                  }}>
                    {appLabels[key]} 
                    {/* Affiche la durée si ce n'est pas une commande de configuration/navigation */}
                    {!isNavButton && ` (${CONFIG.system.intervals?.[key] || CONFIG.system.defaultInterval}s)`}
                  </span>

                  {isFocused && <span style={styles.pointer}>◄</span>}
                </div>
              );
            })}
          </div>

          <div style={styles.footer}>
            <span style={styles.footerText}>CLIC SIMPLE = COCHER LA LIGNE / OUVRIR L'OPTION</span>
            <br />
            <span style={styles.footerText}>DOUBLE-CLIC = RETOUR AU BUREAU</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: '"Courier New", monospace', imageRendering: 'pixelated', userSelect: 'none', backgroundColor: '#fff' },
  window: { width: '540px', height: '460px', backgroundColor: '#fff', border: '2px solid #000', boxShadow: '6px 6px 0px #000', display: 'flex', flexDirection: 'column' },
  titleBar: { height: '24px', borderBottom: '2px solid #000', display: 'flex', alignItems: 'center', padding: '0 8px' },
  closeBox: { width: '10px', height: '10px', border: '2px solid #000', marginRight: '12px' },
  windowTitle: { fontWeight: 'bold', fontSize: '12px', padding: '0 12px', backgroundColor: '#fff' },
  titleLinesLeft: { flexGrow: 1, height: '8px', borderTop: '2px double #000', borderBottom: '2px double #000' },
  titleLinesRight: { flexGrow: 4, height: '8px', borderTop: '2px double #000', borderBottom: '2px double #000' },
  content: { padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '15px' },
  sectionTitle: { fontSize: '13px', fontWeight: '900', letterSpacing: '0.5px' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 },
  row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 10px' },
  checkbox: { width: '14px', height: '14px', border: '2px solid', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  checked: { width: '6px', height: '6px' },
  appLabel: { fontSize: '12px', letterSpacing: '0.5px' },
  pointer: { fontSize: '12px', marginLeft: 'auto', fontWeight: 'bold' },
  footer: { borderTop: '2px dashed #000', paddingTop: '10px', textAlign: 'center', lineHeight: '1.4' },
  footerText: { fontSize: '10px', fontWeight: 'bold' }
};

export default MacSettings;