import React, { useState, useEffect, useRef } from 'react';
import { CONFIG } from './config';

const MacSettings = ({ enabledApps, toggleApp, isAutoCycle, setIsAutoCycle }) => {
  const allKeys = ['autoCycle', 'paint', 'weather', 'clock', 'news', 'stats', 'playing', 'systemSettings', 'backToDesktop'];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);

  const appLabels = {
    autoCycle: "BASCULEMENT AUTOMATIQUE (KIOSK MODE)",
    paint: "APPLE PAINT (DESSIN)",
    weather: "APPLE WEATHER (MÉTÉO)",
    clock: "APPLE CLOCK (HORLOGE)",
    news: "MACNEWS (TÉLÉSCRIPTEUR)",
    stats: "MACSTAT (MONITEUR SYSTÈME)",
    playing: "NOW PLAYING (MUSIQUE)",
    systemSettings: "OPTIONS SYSTÈME (LUMINOSITÉ, ARRET...)",
    backToDesktop: "RETOUR AU BUREAU DE LA BORNE"
  };

  const appIcons = {
    autoCycle: "🔄",
    systemSettings: "⚙️",
    backToDesktop: "🏠"
  };

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % allKeys.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleSelect = () => {
      const currentKey = allKeys[activeIndexRef.current];
      
      if (currentKey === 'autoCycle') {
        setIsAutoCycle(prev => !prev);
      } else if (currentKey === 'systemSettings') {
        window.dispatchEvent(new CustomEvent('mac_switch_view', { detail: 'system_settings' }));
      } else if (currentKey === 'backToDesktop') {
        window.dispatchEvent(new CustomEvent('mac_switch_view', { detail: 'desktop' }));
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
          <div style={styles.closeBox} onClick={() => window.dispatchEvent(new CustomEvent('mac_switch_view', { detail: 'desktop' }))} />
          <div style={styles.titleLines} />
          <span style={styles.windowTitle}>Panneau de Configuration</span>
          <div style={styles.titleLines} />
        </div>

        <div style={styles.content}>
          <span style={styles.sectionTitle}>Configuration du Système :</span>
          
          <div style={styles.listContainer}>
            {allKeys.map((key, index) => {
              const isFocused = index === activeIndex;
              const isChecked = key === 'autoCycle' ? isAutoCycle : enabledApps[key];
              const isAppDisabled = key !== 'autoCycle' && key !== 'systemSettings' && key !== 'backToDesktop' && !enabledApps[key];
              
              // Définitions précises des rôles de boutons
              const isAutoCycleRow = key === 'autoCycle';
              const isSystemNav = key === 'systemSettings' || key === 'backToDesktop';
              const isNavButton = isAutoCycleRow || isSystemNav;

              return (
                <div 
                  key={key} 
                  style={{
                    ...styles.row,
                    backgroundColor: isFocused ? '#000' : '#fff',
                    color: isFocused ? '#fff' : '#000',
                    border: isFocused ? '1px solid #000' : '1px solid transparent',
                    borderBottom: isNavButton ? '2px double #000' : (isFocused ? '1px solid #000' : '1px transparent solid'),
                    marginTop: key === 'backToDesktop' ? 'auto' : '0px',
                    borderRadius: '2px'
                  }}
                >
                  {/* MODIFICATION : On affiche la checkbox si c'est une app classique OU le mode Kiosk */}
                  {!isSystemNav ? (
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
                    <div style={{ width: '14px', height: '14px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {appIcons[key]}
                    </div>
                  )}

                  <span style={{
                    ...styles.appLabel, 
                    textDecoration: isAppDisabled ? 'line-through' : 'none',
                    fontWeight: isNavButton ? '900' : 'bold',
                    marginLeft: isSystemNav ? '8px' : '0px'
                  }}>
                    {isAutoCycleRow && `${appIcons.autoCycle} `}
                    {appLabels[key]} 
                    {!isNavButton && ` (${CONFIG.system.intervals?.[key] || CONFIG.system.defaultInterval}s)`}
                  </span>

                  {isFocused && <span style={styles.pointer}>◄</span>}
                </div>
              );
            })}
          </div>

          <div style={styles.footer}>
            <span style={styles.footerText}>NAVIGATION PAR BALAYAGE AUTOMATIQUE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: '"Courier New", monospace', imageRendering: 'pixelated', userSelect: 'none', backgroundColor: '#fff' },
  window: { width: '540px', height: '460px', backgroundColor: '#fff', border: '2px solid #000', boxShadow: '6px 6px 0px #000', display: 'flex', flexDirection: 'column' },
  titleBar: { height: '28px', borderBottom: '2px solid #000', display: 'flex', alignItems: 'center', padding: '0 8px', backgroundColor: '#fff' },
  closeBox: { width: '12px', height: '12px', border: '2px solid #000', marginRight: '10px', cursor: 'pointer', backgroundColor: '#fff' },
  titleLines: { flexGrow: 1, height: '6px', borderTop: '1px solid #000', borderBottom: '1px solid #000', margin: '0 4px' },
  windowTitle: { fontWeight: 'bold', fontSize: '13px', padding: '0 8px', backgroundColor: '#fff', letterSpacing: '0.5px' },
  content: { padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '12px' },
  sectionTitle: { fontSize: '12px', fontWeight: '900', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '4px' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '3px', flexGrow: 1 },
  row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '5px 8px', boxSizing: 'border-box' },
  checkbox: { width: '12px', height: '12px', border: '2px solid', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '1px', flexShrink: 0 },
  checked: { width: '6px', height: '6px', borderRadius: '1px' },
  appLabel: { fontSize: '11px', letterSpacing: '0.3px' },
  pointer: { fontSize: '11px', marginLeft: 'auto', fontWeight: 'bold' },
  footer: { borderTop: '2px dashed #000', paddingTop: '8px', textAlign: 'center' },
  footerText: { fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }
};

export default MacSettings;