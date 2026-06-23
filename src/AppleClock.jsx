import React, { useState, useEffect } from 'react';

const AppleClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  const todayStr = time.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toUpperCase();

  const totalSecondsInDay = 24 * 60 * 60;
  const currentSeconds = (time.getHours() * 3600) + (time.getMinutes() * 60) + time.getSeconds();
  const dayProgressPercentage = Math.min(100, Math.round((currentSeconds / totalSecondsInDay) * 100));

  const hrAngle = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5;
  const minAngle = time.getMinutes() * 6;
  const secAngle = time.getSeconds() * 6;

  return (
    <div style={styles.container}>
      <div style={styles.window}>
        
        {/* Barre de titre - Modèle Météo (540px) */}
        <div style={styles.titleBar}>
          <div style={styles.closeBox} />
          <div style={styles.titleLinesLeft} />
          <span style={styles.windowTitle}>HORLOGE v1.2</span>
          <div style={styles.titleLinesRight} />
        </div>

        {/* Corps applicatif */}
        <div style={styles.content}>
          <div style={styles.dateText}>{todayStr}</div>
          
          <hr style={styles.separator} />

          {/* Grille Météo v2.2 */}
          <div style={styles.dashboardGrid}>
            
            {/* ÉTAGE 1 : Les Visuels */}
            <div style={styles.visualRow}>
              <div style={styles.leftSlot}>
                <svg width="90" height="90" viewBox="0 0 40 40" style={{ shapeRendering: 'crispEdges' }}>
                  <circle cx="20" cy="20" r="18" stroke="black" strokeWidth="2" fill="white" />
                  <circle cx="20" cy="20" r="15" stroke="black" strokeWidth="1" strokeDasharray="1,3" fill="none" />
                  <circle cx="20" cy="20" r="2" fill="black" />

                  <line 
                    x1="20" y1="20" x2="20" y2="11" 
                    stroke="black" strokeWidth="3" strokeLinecap="square"
                    transform={`rotate(${hrAngle} 20 20)`} 
                  />
                  <line 
                    x1="20" y1="20" x2="20" y2="6" 
                    stroke="black" strokeWidth="2" strokeLinecap="square"
                    transform={`rotate(${minAngle} 20 20)`} 
                  />
                  <line 
                    x1="20" y1="23" x2="20" y2="4" 
                    stroke="black" strokeWidth="1" 
                    transform={`rotate(${secAngle} 20 20)`} 
                  />
                </svg>
              </div>
              
              <div style={styles.rightSlot}>
                <div style={styles.digitalDisplay}>
                  <span style={styles.digits}>{hours}</span>
                  <span style={styles.colon} className="retro-blink">:</span>
                  <span style={styles.digits}>{minutes}</span>
                  <span style={styles.colon} className="retro-blink">:</span>
                  <span style={styles.digits}>{seconds}</span>
                </div>
              </div>
            </div>

            {/* ÉTAGE 2 : Les Textes (Alignés au millimètre sur la baseline) */}
            <div style={styles.labelRow}>
              <div style={styles.leftSlot}>
                <span style={styles.labelText}>ANALOGIQUE</span>
              </div>
              <div style={styles.rightSlot}>
                <span style={styles.labelText}>FORMAT 24 HEURES</span>
              </div>
            </div>

          </div>

          <hr style={styles.separatorMini} />

          {/* Jauge système */}
          <div style={styles.progressContainer}>
            <span style={styles.progressLabel}>JOURNÉE ÉCOULÉE : {dayProgressPercentage}%</span>
            <div style={styles.progressBarOuter}>
              <div style={{ ...styles.progressBarInner, width: `${dayProgressPercentage}%` }} />
            </div>
          </div>

        </div>
      </div>

      {/* RE-SET DES MARGES GLOBAL DE FIREFOX INJECTÉ ICI */}
      <style>{`
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important; /* Tue définitivement le scroll de page */
          background-color: #fff;
        }
        * {
          box-sizing: border-box !important;
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .retro-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',  // Remplacé 100vw par 100% calé sur le body reset
    height: '100%', // Remplacé 100vh par 100% calé sur le body reset
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Courier New", Courier, monospace',
    imageRendering: 'pixelated',
    userSelect: 'none',
  },
  window: {
    width: '540px',
    height: '420px', 
    backgroundColor: '#fff',
    border: '2px solid #000',
    boxShadow: '6px 6px 0px #000',
    display: 'flex',
    flexDirection: 'column',
  },
  titleBar: {
    height: '24px',
    borderBottom: '2px solid #000',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    backgroundColor: '#fff',
  },
  closeBox: {
    width: '10px',
    height: '10px',
    border: '2px solid #000',
    backgroundColor: '#fff',
    marginRight: '12px',
  },
  windowTitle: {
    fontWeight: 'bold',
    fontSize: '12px',
    padding: '0 12px',
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  titleLinesLeft: {
    flexGrow: 1,
    height: '8px',
    borderTop: '2px double #000',
    borderBottom: '2px double #000',
  },
  titleLinesRight: {
    flexGrow: 4,
    height: '8px',
    borderTop: '2px double #000',
    borderBottom: '2px double #000',
  },
  content: {
    padding: '12px 25px', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: '13px',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '1.1',
  },
  separator: {
    width: '100%',
    border: 'none',
    borderTop: '2px dashed #000',
    margin: '8px 0',
  },
  separatorMini: {
    width: '100%',
    border: 'none',
    borderTop: '2px dotted #000',
    margin: '10px 0',
  },
  dashboardGrid: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  visualRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  labelRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'baseline',
  },
  leftSlot: {
    width: '180px',
    display: 'flex',
    justifyContent: 'center',
  },
  rightSlot: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  digitalDisplay: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    border: '2px solid #000',
    padding: '8px 16px',
    boxShadow: '4px 4px 0px #000',
  },
  digits: {
    fontSize: '38px',
    fontWeight: '900',
    fontVariantNumeric: 'tabular-nums', 
    lineHeight: '1',
  },
  colon: {
    fontSize: '34px',
    fontWeight: '900',
    padding: '0 2px',
    position: 'relative',
    top: '-2px',
  },
  labelText: {
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  progressContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  progressLabel: {
    fontSize: '11px',
    fontWeight: 'bold',
  },
  progressBarOuter: {
    width: '100%',
    height: '14px',
    border: '2px solid #000',
    backgroundColor: '#fff',
    padding: '2px',
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: '#000',
  }
};

export default AppleClock;