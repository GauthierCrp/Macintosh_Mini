import React, { useState, useEffect } from 'react';
import { CONFIG } from './config';

const MacStat = () => {
  const TARGET_IP = CONFIG.glances.serverIp; 
  const PORT = CONFIG.glances.port;
  const URL = CONFIG.glances.apiUrl;

  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState({
    cpu: 0,
    ram: 0,
    diskUsed: 0,
    netDown: 0,
    netUp: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      setTime(new Date());

      const URL_V4 = `http://${TARGET_IP}:${PORT}/api/4/all`;

      fetch(URL_V4)
        .then((res) => {
          if (!res.ok) throw new Error('HOTE INTROUVABLE');
          return res.json();
        })
        .then((data) => {
          setError(null);

          // 1. CPU
          const cpuPercent = Math.round(data.cpu?.total ?? data.cpu?.user ?? 0);

          // 2. RAM
          const ramPercent = Math.round(data.mem?.percent ?? 0);

          // 3. DISQUE
          const rootDisk = data.fs?.find(disk => disk.mnt_point === '/') || data.fs?.[0];
          const diskPercent = rootDisk ? Math.round(rootDisk.percent) : 0;

          // 4. RESEAU TOTAL (Cumul de toutes les interfaces physiques actives)
          const networkData = data.network || [];

          let totalRxBytesPerSec = 0;
          let totalTxBytesPerSec = 0;

          networkData.forEach(net => {
            // On élimine la boucle locale
            if (net.interface_name !== 'lo') {
              // Extraction en utilisant tes vraies clés JSON de l'API v4
              const rxRate = net.bytes_recv_rate_per_sec ?? 0;
              const txRate = net.bytes_sent_rate_per_sec ?? 0;
              
              totalRxBytesPerSec += rxRate;
              totalTxBytesPerSec += txRate;
            }
          });

          // Conversion des Octets/sec -> Méga-octets/sec (MB/S)
          let downMB = totalRxBytesPerSec > 0 ? parseFloat((totalRxBytesPerSec / (1024 * 1024)).toFixed(1)) : 0;
          let upMB = totalTxBytesPerSec > 0 ? parseFloat((totalTxBytesPerSec / (1024 * 1024)).toFixed(1)) : 0;

          // Seuil minimal d'activité pour animer l'écran vintage dès qu'un octet passe
          if (totalRxBytesPerSec > 0 && downMB === 0) downMB = 0.1;
          if (totalTxBytesPerSec > 0 && upMB === 0) upMB = 0.1;

          setStats({
            cpu: cpuPercent,
            ram: ramPercent,
            diskUsed: diskPercent,
            netDown: downMB,
            netUp: upMB
          });
        })
        .catch((err) => {
          setError("CONNEXION IMPOSSIBLE");
        });
    };

    fetchData();
    const timer = setInterval(fetchData, 2000);

    return () => clearInterval(timer);
  }, [TARGET_IP, PORT]);

  const todayStr = time.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toUpperCase();

  return (
    <div style={styles.container}>
      <div style={styles.window}>
        
        {/* Barre de titre */}
        <div style={styles.titleBar}>
          <div style={styles.closeBox} />
          <div style={styles.titleLinesLeft} />
          <span style={styles.windowTitle}>MACSTAT v1.1</span>
          <div style={styles.titleLinesRight} />
        </div>

        {/* Corps applicatif */}
        <div style={styles.content}>
          <div>Monitoring System</div>
          
          <hr style={styles.separator} />

          {error ? (
            <div style={styles.errorContainer}>
              <span style={styles.errorText}>[!] ERREUR RESEAU</span>
              <span style={styles.errorSubText}>{error}</span>
              <span style={styles.errorSubText}>HOTE : {TARGET_IP}</span>
            </div>
          ) : (
            <>
              {/* ÉTAGE 1 & 2 : CPU & RAM */}
              <div style={styles.dashboardGrid}>
                <div style={styles.visualRow}>
                  <div style={styles.leftSlot}>
                    <div style={styles.statBox}>
                      <span style={styles.statValue}>{stats.cpu}%</span>
                      <div style={styles.miniBarOuter}>
                        <div style={{ ...styles.miniBarInner, width: `${stats.cpu}%` }} />
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.rightSlot}>
                    <div style={styles.statBox}>
                      <span style={styles.statValue}>{stats.ram}%</span>
                      <div style={styles.miniBarOuter}>
                        <div style={{ ...styles.miniBarInner, width: `${stats.ram}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.labelRow}>
                  <div style={styles.leftSlot}>
                    <span style={styles.labelText}>CHARGE CPU</span>
                  </div>
                  <div style={styles.rightSlot}>
                    <span style={styles.labelText}>MEMOIRE VIVE</span>
                  </div>
                </div>
              </div>

              <hr style={styles.separatorMini} />

              {/* ÉTAGE 3 & 4 : Stockage & Réseau (Alignement corrigé) */}
              <div style={styles.dashboardGrid}>
                <div style={styles.visualRow}>
                  
                  {/* Bloc Disque avec conteneur identique au réseau pour l'alignement */}
                  <div style={styles.leftSlot}>
                    <div style={styles.dataDisplayBox}>
                      <svg width="34" height="34" viewBox="0 0 24 24" style={{ shapeRendering: 'crispEdges' }}>
                        <rect x="2" y="5" width="20" height="14" rx="1" stroke="black" strokeWidth="1.5" fill="white" />
                        <line x1="2" y1="15" x2="22" y2="15" stroke="black" strokeWidth="1.5" />
                        <line x1="5" y1="9" x2="9" y2="9" stroke="black" strokeWidth="1.5" />
                        <line x1="5" y1="11" x2="9" y2="11" stroke="black" strokeWidth="1.5" />
                        <rect x="15" y="8" width="3" height="3" fill={stats.cpu > 40 ? "black" : "none"} stroke="black" strokeWidth="1" />
                      </svg>
                      <span style={styles.networkValue}>{stats.diskUsed}%</span>
                    </div>
                  </div>

                  {/* Bloc Réseau */}
                  <div style={styles.rightSlot}>
                    <div style={styles.dataDisplayBox}>
                      <div style={styles.netLine}>
                        <span style={styles.netArrow}>▲</span>
                        <span style={styles.networkValue}>{stats.netUp} MB/S</span>
                      </div>
                      <div style={styles.netLine}>
                        <span style={styles.netArrow}>▼</span>
                        <span style={styles.networkValue}>{stats.netDown} MB/S</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Légendes parfaitement alignées au millimètre sur la baseline */}
                <div style={styles.labelRow}>
                  <div style={styles.leftSlot}>
                    <span style={styles.labelText}>NODE ROOT DISK</span>
                  </div>
                  <div style={styles.rightSlot}>
                    <span style={styles.labelText}>TRAFIC ETH NET</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <hr style={styles.separatorMini} />

          {/* Pied de la fenêtre */}
          <div style={styles.progressContainer}>
            <span style={styles.progressLabel}>
              {error ? "STATUT SATELLITE : DECONNECTE" : `STATUT SATELLITE : CONNECTE A ${TARGET_IP}`}
            </span>
            <div style={styles.progressBarOuter}>
              <div style={{ ...styles.progressBarInner, width: error ? '0%' : '100%' }} />
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
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Courier New", Courier, monospace',
    imageRendering: 'pixelated',
    userSelect: 'none',
    backgroundColor: '#d4d6cd'
  },
  window: {
    width: '540px',
    height: '420px', 
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
  },
  closeBox: {
    width: '10px',
    height: '10px',
    border: '2px solid #000',
    marginRight: '12px',
  },
  windowTitle: {
    fontWeight: 'bold',
    fontSize: '12px',
    padding: '0 12px',
    backgroundColor: '#fff',
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
  },
  separator: {
    width: '100%',
    border: 'none',
    borderTop: '2px dashed #000',
    margin: '6px 0',
  },
  separatorMini: {
    width: '100%',
    border: 'none',
    borderTop: '2px dotted #000',
    margin: '6px 0',
  },
  dashboardGrid: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px', // Standardisation des espacements verticaux entre les lignes et leurs légendes
  },
  visualRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  labelRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'baseline', // Verrouille l'alignement parfait des textes sur l'horizontale
  },
  leftSlot: {
    width: '240px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSlot: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    width: '180px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '900',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '1',
  },
  miniBarOuter: {
    width: '100%',
    height: '10px',
    border: '2px solid #000',
    padding: '1px',
  },
  miniBarInner: {
    height: '100%',
    backgroundColor: '#000',
    transition: 'width 0.4s ease-out',
  },

  dataDisplayBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#fff',
    border: '2px solid #000',
    padding: '8px 12px',
    boxShadow: '4px 4px 0px #000',
    width: '180px',
    height: '58px', // Hauteur fixe stricte pour forcer la symétrie visuelle
  },
  netLine: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '8px',
  },
  netArrow: {
    fontSize: '11px',
    fontWeight: 'bold',
  },
  networkValue: {
    fontSize: '18px',
    fontWeight: '900',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '1',
  },
  labelText: {
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    textAlign: 'center',
    width: '180px', // Aligné sur la largeur des blocs du dessus
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    height: '140px',
    border: '2px dashed #000',
    width: '100%',
  },
  errorText: {
    fontSize: '14px',
    fontWeight: '900',
  },
  errorSubText: {
    fontSize: '11px',
    fontWeight: 'bold',
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
    padding: '2px',
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: '#000',
  }
};

export default MacStat;