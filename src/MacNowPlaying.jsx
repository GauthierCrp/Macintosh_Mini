import React, { useState, useEffect, useRef } from 'react';
import { CONFIG } from './config';

const MacNowPlaying = () => {
  const MASS_SERVER_IP = CONFIG.musicAssistant.serverIp; 
  const MASS_PORT = CONFIG.musicAssistant.port;
  const TARGET_PLAYER_NAME = CONFIG.musicAssistant.targetPlayerName;
  const MASS_USER = CONFIG.musicAssistant.credentials.username; 
  const MASS_PASSWORD = CONFIG.musicAssistant.credentials.password;

  const [track, setTrack] = useState({
    title: "AUCUNE DIFFUSION", artist: "SILENCE SÉQUENTIEL", album: "SYSTEM SHUTDOWN",
    duration: 0, elapsed: 0, isPlaying: false, coverUrl: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsStatus, setWsStatus] = useState("DISCONNECTED");
  
  const wsRef = useRef(null);
  const playerStateRef = useRef({ id: null, isPlaying: false });

  const getUniqueId = () => `msg-${Math.random().toString(36).substr(2, 9)}`;

  const handleQueueData = (queueData) => {
    if (!queueData) return;

    let targetQueue = null;
    if (Array.isArray(queueData)) {
      targetQueue = queueData.find(q => q.name?.toUpperCase() === TARGET_PLAYER_NAME.toUpperCase() || q.queue_id === playerStateRef.current.id);
    } else if (queueData.name?.toUpperCase() === TARGET_PLAYER_NAME.toUpperCase() || queueData.queue_id === playerStateRef.current.id) {
      targetQueue = queueData;
    }

    if (targetQueue) {
      if (targetQueue.queue_id) playerStateRef.current.id = targetQueue.queue_id;
      const activeItem = targetQueue.current_item;

      if (activeItem) {
        const rawTitle = activeItem.name || "MORCEAU INCONNU";
        
        let rawArtist = "ARTISTE INCONNU";
        if (activeItem.artists && activeItem.artists[0]) {
          rawArtist = activeItem.artists[0].name || activeItem.artists[0] || "ARTISTE INCONNU";
        } else if (activeItem.artist) {
          rawArtist = activeItem.artist;
        }

        const rawAlbum = activeItem.album?.name || activeItem.album || "ALBUM INCONNU";

        setTrack(prev => ({
          ...prev,
          title: String(rawTitle).toUpperCase(),
          artist: String(rawArtist).toUpperCase(),
          album: String(rawAlbum).toUpperCase(),
          duration: activeItem.duration || targetQueue.duration || 0,
          elapsed: targetQueue.elapsed_time || 0,
          isPlaying: playerStateRef.current.isPlaying 
        }));
      } else {
        setTrack(prev => ({
          ...prev,
          title: "AUCUNE DIFFUSION", artist: "SILENCE SÉQUENTIEL", album: "SYSTEM SHUTDOWN",
          duration: 0, elapsed: 0
        }));
      }
    }
  };

  const handlePlayerData = (playerData) => {
    if (!playerData) return;

    let targetPlayer = null;
    if (Array.isArray(playerData)) {
      targetPlayer = playerData.find(p => p.name?.toUpperCase() === TARGET_PLAYER_NAME.toUpperCase());
    } else if (playerData.name?.toUpperCase() === TARGET_PLAYER_NAME.toUpperCase()) {
      targetPlayer = playerData;
    }

    if (targetPlayer) {
      playerStateRef.current.id = targetPlayer.player_id;
      const isPlaying = targetPlayer.playback_state === "playing" || targetPlayer.state === "playing";
      playerStateRef.current.isPlaying = isPlaying;

      setTrack(prev => ({
        ...prev,
        isPlaying: isPlaying,
        elapsed: targetPlayer.elapsed_time !== undefined ? targetPlayer.elapsed_time : prev.elapsed
      }));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const startLifecycle = async () => {
      try {
        setWsStatus("GETTING TOKEN...");
        
        const loginResponse = await fetch(`http://${MASS_SERVER_IP}:${MASS_PORT}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider_id: "builtin",
            credentials: { username: MASS_USER, password: MASS_PASSWORD }
          })
        });

        if (!loginResponse.ok) throw new Error(`HTTP error! status: ${loginResponse.status}`);

        const loginData = await loginResponse.json();
        const sessionToken = loginData.token;

        if (!sessionToken) throw new Error("Aucun token renvoyé");
        if (!isMounted) return;

        const wsUrl = `ws://${MASS_SERVER_IP}:${MASS_PORT}/ws`;
        setWsStatus("CONNECTING WS...");
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          if (!isMounted) return;
          setWsStatus("AUTHENTICATING...");
          
          wsRef.current.send(JSON.stringify({
            message_id: "auth-init",
            command: "auth",
            args: { token: sessionToken }
          }));
        };

        wsRef.current.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);

            if (response.message_id === "auth-init") {
              if (response.result && response.result.authenticated) {
                setWsStatus("CONNECTED");
                setError(null);
                setLoading(false);

                wsRef.current.send(JSON.stringify({
                  message_id: getUniqueId(),
                  command: "players/all",
                  args: {}
                }));

                wsRef.current.send(JSON.stringify({
                  message_id: getUniqueId(),
                  command: "player_queues/all",
                  args: {}
                }));
              } else {
                setWsStatus("AUTH_FAILED");
                setError("TOKEN REJETÉ");
              }
              return;
            }

            if (response.error_code) return;

            if (response.result) {
              if (Array.isArray(response.result)) {
                if (response.result.length > 0 && 'playback_state' in response.result[0]) {
                  handlePlayerData(response.result);
                } else if (response.result.length > 0 && 'current_item' in response.result[0]) {
                  handleQueueData(response.result);
                }
              }
            }

            if (response.event === "player_updated" && response.data) {
              handlePlayerData(response.data);
            }
            
            if ((response.event === "queue_updated" || response.event === "queue_time_updated") && response.data) {
              handleQueueData(response.data);
            }

          } catch (err) {
            console.error("Erreur parsing JSON:", err);
          }
        };

        wsRef.current.onerror = () => {
          if (!isMounted) return;
          setWsStatus("ERROR");
          setError("ÉCHEC SOCKET RESEAU");
          setLoading(false);
        };

        wsRef.current.onclose = () => {
          if (!isMounted) return;
          setWsStatus("CLOSED");
          setTimeout(startLifecycle, 5000);
        };

      } catch (err) {
        console.error("Erreur cycle:", err);
        if (isMounted) {
          setWsStatus("AUTH_FAILED");
          setError("ÉCHEC POST/API");
          setLoading(false);
          setTimeout(startLifecycle, 5000);
        }
      }
    };

    startLifecycle();

    return () => {
      isMounted = false;
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (!track.isPlaying || track.duration === 0) return;
    const progressInterval = setInterval(() => {
      setTrack(prev => {
        if (prev.elapsed >= prev.duration) return prev;
        return { ...prev, elapsed: prev.elapsed + 1 };
      });
    }, 1000);
    return () => clearInterval(progressInterval);
  }, [track.isPlaying, track.duration]);

  const progressPercent = track.duration > 0 ? Math.min(100, Math.round((track.elapsed / track.duration) * 100)) : 0;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      {/* Injection des animations CSS directement pour conserver le fichier unique */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .retro-vinyl {
          animation: spin 3s linear infinite;
        }
        .retro-vinyl.paused {
          animation-play-state: paused;
        }
      `}</style>

      <div style={styles.window}>
        <div style={styles.titleBar}>
          <div style={styles.closeBox} />
          <div style={styles.titleLinesLeft} />
          <span style={styles.windowTitle}>NOW PLAYING v1.6</span>
          <div style={styles.titleLinesRight} />
        </div>

        <div style={styles.content}>
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <div style={styles.statusText}>INITIALISATION RETRO-SYSTEM...</div>
              <div style={{ fontFamily: 'monospace', fontSize: '10px', marginTop: '10px' }}>BUS ÉTAT : {wsStatus}</div>
            </div>
          ) : error ? (
            <div style={styles.errorContainer}>
              <span style={styles.errorText}>ERREUR SYSTÈME AUDIO</span>
              <span style={styles.errorSubText}>{error}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '9px', marginTop: '8px' }}>DERNIER CODE : {wsStatus}</span>
            </div>
          ) : (
            <div style={styles.playerGrid}>
              <div style={styles.coverContainer}>
                <div 
                  className={`retro-vinyl ${!track.isPlaying ? 'paused' : ''}`}
                  style={styles.vinylDisc}
                >
                  {/* Sillons du vinyle */}
                  <div style={styles.vinylGroove1} />
                  <div style={styles.vinylGroove2} />
                  {/* MacMac MacLabel au centre */}
                  <div style={styles.vinylLabel}>
                    <div style={styles.vinylCenterDot} />
                  </div>
                </div>
              </div>

              <div style={styles.metaContainer}>
                <h1 style={styles.trackTitle}>{track.title}</h1>
                <h2 style={styles.trackArtist}>{track.artist}</h2>
                <h3 style={styles.trackAlbum}>{track.album}</h3>
              </div>

              <div style={styles.progressSection}>
                <div style={styles.timeLabel}>{formatTime(track.elapsed)}</div>
                <div style={styles.progressBarTrack}>
                  <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
                </div>
                <div style={styles.timeLabel}>{formatTime(track.duration)}</div>
              </div>

              <div style={styles.statusBadge}>
                {track.isPlaying ? "● TIDAL AUDIO STREAM" : "■ EN PAUSE"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  window: { width: '540px', height: '420px', border: '2px solid #000', boxShadow: '6px 6px 0px #000', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' },
  titleBar: { height: '24px', borderBottom: '2px solid #000', display: 'flex', alignItems: 'center', padding: '0 8px', backgroundColor: '#ffffff' },
  closeBox: { width: '10px', height: '10px', border: '2px solid #000', backgroundColor: '#ffffff', marginRight: '12px', flexShrink: 0 },
  windowTitle: { fontWeight: 'bold', fontSize: '12px', padding: '0 12px', textAlign: 'center', backgroundColor: '#ffffff', flexShrink: 0 },
  titleLinesLeft: { flexGrow: 1, height: '8px', borderTop: '2px double #000', borderBottom: '2px double #000' },
  titleLinesRight: { flexGrow: 4, height: '8px', borderTop: '2px double #000', borderBottom: '2px double #000' },
  content: { margin: '15px 25px 25px 25px', padding: '20px', border: '2px solid #000', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, boxSizing: 'border-box', boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.1)' },
  playerGrid: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '16px' },
  
  // Conteneur de la zone d'animation
  coverContainer: { width: '120px', height: '120px', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', boxShadow: '3px 3px 0px #000', overflow: 'hidden' },
  
  // Design CSS du Vinyle Retro
  vinylDisc: { width: '104px', height: '106px', borderRadius: '50%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid #000' },
  vinylGroove1: { position: 'absolute', width: '85px', height: '84px', borderRadius: '50%', border: '2px dashed #fff', opacity: 0.35 },
  vinylGroove2: { position: 'absolute', width: '64px', height: '64px', borderRadius: '50%', border: '2px dotted #fff', opacity: 0.5 },
  vinylLabel: { width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  vinylCenterDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#000' },

  metaContainer: { textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' },
  trackTitle: { fontSize: '18px', fontWeight: '900', margin: 0, letterSpacing: '0.5px', wordBreak: 'break-word', color: '#000' },
  trackArtist: { fontSize: '14px', fontWeight: '700', margin: 0, textTransform: 'uppercase', color: '#000' },
  trackAlbum: { fontSize: '11px', fontWeight: 'normal', margin: 0, fontStyle: 'italic', color: '#555', textTransform: 'uppercase' },
  progressSection: { display: 'flex', alignItems: 'center', width: '100%', gap: '10px', marginTop: '4px' },
  timeLabel: { fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace', width: '40px', textAlign: 'center' },
  progressBarTrack: { flexGrow: 1, height: '12px', border: '2px solid #000', backgroundColor: '#fff', padding: '1px' },
  progressBarFill: { height: '100%', backgroundColor: '#000' },
  statusBadge: { fontSize: '11px', fontWeight: '900', border: '2px solid #000', padding: '4px 12px', backgroundColor: '#fff', boxShadow: '2px 2px 0px #000', letterSpacing: '1px' },
  statusText: { fontSize: '14px', fontWeight: 'bold' },
  errorContainer: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' },
  errorText: { fontSize: '14px', fontWeight: '900' },
  errorSubText: { fontSize: '11px', color: '#666' }
};

export default MacNowPlaying;