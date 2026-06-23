import React, { useState, useEffect, useRef } from 'react';
import ErrorBoundary from './ErrorBoundary';
import HappyMac from './HappyMac';
import ApplePaint from './ApplePaint';
import AppleWeather from './AppleWeather';
import AppleClock from './AppleClock';
import MacNews from './MacNews';
import MacStat from './MacStat';
import MacSettings from './MacSettings';
import MacSystemSettings from './MacSystemSettings';
import MacNowPlaying from './MacNowPlaying';
import { CONFIG } from './config';
import logoMac from './logo_apple.png';

const BACKGROUND_COLOR = '#f0f1ec'; 
const LONG_PRESS_DURATION = 1500; 

const App = () => {
  const [enabledApps, setEnabledApps] = useState({
    happy: true,
    paint: false,
    weather: true,
    clock: true,
    news: true,
    stats: true,
    settings: true,
    playing: true
  });

  const [currentView, setCurrentView] = useState('happy');
  const viewOrder = ['happy', 'paint', 'weather', 'playing', 'clock', 'news', 'stats'];
  
  const longPressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const currentViewRef = useRef(currentView);
  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  // Gestion de l'état global du cycle automatique
  const [isAutoCycle, setIsAutoCycle] = useState(true);
  useEffect(() => {
    if (!isAutoCycle || currentView === 'settings' || currentView === 'system_settings') return;

    const appDurationSeconds = CONFIG.system.intervals?.[currentView] || CONFIG.system.defaultInterval || 30;

    const timer = setTimeout(() => {
      triggerNextView();
    }, appDurationSeconds * 1000);

    return () => clearTimeout(timer);
  }, [isAutoCycle, currentView, enabledApps]);

  // Écoute de la navigation inter-vues
  useEffect(() => {
    const handleViewSwitch = (e) => {
      const destination = e.detail;
      if (destination === 'system_settings') {
        setCurrentView('system_settings');
      } else if (destination === 'settings') {
        setCurrentView('settings');
      } else if (destination === 'desktop') {
        setCurrentView('happy');
      }
    };
    window.addEventListener('mac_switch_view', handleViewSwitch);
    return () => window.removeEventListener('mac_switch_view', handleViewSwitch);
  }, []);

  // CONFIGURATION DES ÉCOUTEURS GLOBAUX SOURIS / TACTILE (Résout le blocage par les sous-apps)
  useEffect(() => {
    const handleGlobalPointerDown = (e) => {
      if (e.target.closest('.mac-menu-bar')) return;

      isLongPressRef.current = false;

      longPressTimerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        
        if (currentViewRef.current !== 'settings' && currentViewRef.current !== 'system_settings') {
          setCurrentView('settings');
        } else {
          setCurrentView('happy');
        }
      }, LONG_PRESS_DURATION);
    };

    const handleGlobalPointerUp = (e) => {
      if (e.target.closest('.mac-menu-bar')) return;

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }

      if (!isLongPressRef.current) {
        if (currentViewRef.current !== 'settings' && currentViewRef.current !== 'system_settings') {
          triggerNextView();
        } else {
          window.dispatchEvent(new CustomEvent('mac_trigger_select'));
        }
      }
    };

    // Attachement au plus haut niveau (window) capturant tout
    window.addEventListener('mousedown', handleGlobalPointerDown, true);
    window.addEventListener('mouseup', handleGlobalPointerUp, true);
    window.addEventListener('touchstart', handleGlobalPointerDown, true);
    window.addEventListener('touchend', handleGlobalPointerUp, true);

    return () => {
      window.removeEventListener('mousedown', handleGlobalPointerDown, true);
      window.removeEventListener('mouseup', handleGlobalPointerUp, true);
      window.removeEventListener('touchstart', handleGlobalPointerDown, true);
      window.removeEventListener('touchend', handleGlobalPointerUp, true);
    };
  }, []);

  const toggleApp = (appKey) => {
    setEnabledApps(prev => ({ ...prev, [appKey]: !prev[appKey] }));
  };

  const triggerNextView = () => {
    if (currentViewRef.current === 'settings' || currentViewRef.current === 'system_settings') return;
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

      case 'system_settings':
        return <MacSystemSettings {...sharedProps} />;

      default: return <HappyMac {...sharedProps} />;
    }
  };

  return (
    <div 
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
          <span style={styles.menuItem} onClick={() => setCurrentView('settings')}></span>
          <span style={styles.menuItem}>Fichier</span>
          <span style={styles.menuItem}>Édition</span>
          <span style={styles.menuItem} onClick={() => setCurrentView('settings')}>Spécial</span>
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