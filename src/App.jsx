import React, { useState, useEffect, useRef } from 'react';
import ErrorBoundary from './ErrorBoundary';
import HappyMac from './HappyMac';
import ApplePaint from './ApplePaint';
import AppleWeather from './AppleWeather';
import AppleClock from './AppleClock';
import MacNews from './MacNews';
import MacStat from './MacStat';
import MacSettings from './MacSettings';
import MacSystemSettings from './MacSystemSettings'; // 1. AJOUT DE L'IMPORT
import MacNowPlaying from './MacNowPlaying';
import { CONFIG } from './config';
import logoMac from './logo_apple.png';

const BACKGROUND_COLOR = '#f0f1ec'; 

const App = () => {
  const [enabledApps, setEnabledApps] = useState({
    happy: true,
    paint: true,
    weather: true,
    clock: true,
    news: true,
    stats: true,
    settings: true,
    playing: true
  });

  const [currentView, setCurrentView] = useState('happy');
  const clickTimeoutRef = useRef(null);
  const doubleClickTimeoutRef = useRef(null);
  const viewOrder = ['happy', 'paint', 'weather', 'playing', 'clock', 'news', 'stats'];

  // Gestion de l'état global du cycle automatique
  const [isAutoCycle, setIsAutoCycle] = useState(false);
  useEffect(() => {
    // Désactivation du cycle si on est dans les menus de configuration OU du système
    if (!isAutoCycle || currentView === 'settings' || currentView === 'system_settings') return;

    const appDurationSeconds = CONFIG.system.intervals?.[currentView] || CONFIG.system.defaultInterval || 30;

    const timer = setTimeout(() => {
      triggerNextView();
    }, appDurationSeconds * 1000);

    return () => clearTimeout(timer);
  }, [isAutoCycle, currentView, enabledApps]);

  // 2. ÉCOUTE DE L'ÉVÉNEMENT DE NAVIGATION DEPUIS MACSETTINGS
  useEffect(() => {
    const handleViewSwitch = (e) => {
      if (e.detail === 'system_settings') {
        setCurrentView('system_settings');
      }
    };
    window.addEventListener('mac_switch_view', handleViewSwitch);
    return () => window.removeEventListener('mac_switch_view', handleViewSwitch);
  }, []);

  const toggleApp = (appKey) => {
    setEnabledApps(prev => ({ ...prev, [appKey]: !prev[appKey] }));
  };

  const triggerNextView = () => {
    if (currentView === 'settings' || currentView === 'system_settings') return;
    setCurrentView(prevView => {
      let currentIndex = viewOrder.indexOf(prevView);
      if (currentIndex === -1) currentIndex = 0; 
      let nextIndex = (currentIndex + 1) % viewOrder.length;
      while (!enabledApps[viewOrder[nextIndex]]) {
        nextIndex = (nextIndex + 1) % viewOrder.length;
        if (nextIndex === currentIndex) return prevView;
      }
      return viewOrder[nextIndex];
    });
  };

  const handleGlobalClick = (e) => {
    if (e.target.closest('.mac-menu-bar')) return;

    // --- 1. GESTION DU SIMPLE CLIC ---
    if (clickTimeoutRef.current === null && e.detail === 1) {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        
        if (currentView !== 'settings' && currentView !== 'system_settings') {
          triggerNextView();
        } else {
          window.dispatchEvent(new CustomEvent('mac_trigger_select'));
        }
      }, 800);
    } 
    
    // --- 2. GESTION DU DOUBLE CLIC ---
    else if (e.detail === 2) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      doubleClickTimeoutRef.current = setTimeout(() => {
        doubleClickTimeoutRef.current = null;
        
        if (currentView === 'happy') {
          setCurrentView('settings');
        } else if (currentView === 'settings') {
          setCurrentView('happy'); 
        } else if (currentView === 'system_settings') {
          setCurrentView('settings');
        }
      }, 800);
    }
  };

  const closeSettings = () => {
    setCurrentView('happy');
  };

  const renderView = () => {
    const sharedProps = { bgTheme: BACKGROUND_COLOR };

    switch (currentView) {
      case 'happy': return <HappyMac {...sharedProps} />;
      case 'paint': return <ApplePaint {...sharedProps} />;
      case 'weather': return <AppleWeather {...sharedProps} />;
      case 'clock': return <AppleClock {...sharedProps} />;
      case 'news': return <MacNews {...sharedProps} />;
      case 'stats': return <MacStat {...sharedProps} />;
      case 'playing': return <MacNowPlaying {...sharedProps} />;
      
      case 'settings': 
        return (
          <MacSettings 
            enabledApps={enabledApps} 
            toggleApp={toggleApp} 
            onClose={closeSettings} 
            isAutoCycle={isAutoCycle}
            setIsAutoCycle={setIsAutoCycle}
            {...sharedProps} 
          />
        );

      // 3. RENDER DE LA NOUVELLE VUE OPTIONS SYSTÈME
      case 'system_settings':
        return <MacSystemSettings {...sharedProps} />;

      default: return <HappyMac {...sharedProps} />;
    }
  };

  return (
    <div 
      onClick={handleGlobalClick} 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: BACKGROUND_COLOR,
        overflow: 'hidden', 
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Courier New", Courier, monospace'
      }}
    >
      {/* Barre supérieure Mac Classic */}
      <div className="mac-menu-bar" style={styles.menuBar}>
        <div style={styles.menuLeft}>
          <img src={logoMac} alt="Logo" style={styles.appleLogo} />
          <span style={styles.menuItem}>Fichier</span>
          <span style={styles.menuItem}>Édition</span>
          <span style={styles.menuItem}>Spécial</span>
        </div>
        <div style={styles.menuRight}>
          <span style={styles.menuItem}>
            {isAutoCycle && currentView !== 'settings' && currentView !== 'system_settings' ? '● ' : ''}
            {currentView.toUpperCase().replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Conteneur de l'application active */}
      <div style={styles.workspace}>
        <ErrorBoundary key={currentView} onNext={triggerNextView}>
          {renderView()}
        </ErrorBoundary>
      </div>

      <style>{`
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          background-color: ${BACKGROUND_COLOR};
        }
        * {
          box-sizing: border-box !important;
        }
      `}</style>
    </div>
  );
};

const styles = {
  menuBar: {
    height: '22px',
    backgroundColor: '#fff',
    borderBottom: '2px solid #000',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 12px',
    fontSize: '12px',
    fontWeight: 'bold',
    zIndex: 9999
  },
  menuLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  menuItem: { cursor: 'default' },
  menuRight: { display: 'flex', alignItems: 'center' },
  workspace: {
    flexGrow: 1,
    width: '100%',
    height: 'calc(100vh - 22px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  appleLogo: {
    height: '16px',
    width: 'auto',
    display: 'inline-block',
    cursor: 'default',
    imageRendering: 'pixelated'
  }
};

export default App;