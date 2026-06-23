import React, { useState, useEffect } from 'react';
import { CONFIG } from './config';

const AppleWeather = () => {
  const CITY_NAME = CONFIG.weather.cityName;
  const LATITUDE = CONFIG.weather.latitude;
  const LONGITUDE = CONFIG.weather.longitude;

  const [weatherData, setWeatherData] = useState({
    temp: null,
    condition: 'Chargement...',
    icon: 'cloud',
    forecast: []
  });
  const [error, setError] = useState(null);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toUpperCase();

  const mapWeatherCode = (code) => {
    if (code === 0) return { cond: 'Ensoleillé', ico: 'sun' };
    if ([1, 2, 3].includes(code)) return { cond: 'Nuageux', ico: 'cloud' };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) {
      return { cond: 'Pluvieux', ico: 'rain' };
    }
    return { cond: 'Variable', ico: 'cloud' };
  };

  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Erreur réseau');
        return res.json();
      })
      .then((data) => {
        const currentMeta = mapWeatherCode(data.current.weather_code);
        const currentTemp = Math.round(data.current.temperature_2m);

        const nextDays = [];
        for (let i = 1; i <= 3; i++) {
          const dateStr = data.daily.time[i];
          const dayName = new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
          const meta = mapWeatherCode(data.daily.weather_code[i]);
          const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
          const minTemp = Math.round(data.daily.temperature_2m_min[i]);

          nextDays.push({
            day: dayName.replace('.', ''),
            icon: meta.ico,
            tempMax: maxTemp,
            tempMin: minTemp
          });
        }

        setWeatherData({
          temp: currentTemp,
          condition: currentMeta.cond,
          icon: currentMeta.ico,
          forecast: nextDays
        });
      })
      .catch((err) => {
        console.error(err);
        setError('ERREUR API');
      });
  }, []);

  const WeatherIcon = ({ type, size = 80 }) => {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 40 40" 
        style={{ shapeRendering: 'crispEdges' }}
      >
        {type === 'sun' && (
          <g stroke="black" strokeWidth="2" fill="none">
            <circle cx="20" cy="20" r="8" fill="white" strokeWidth="2" />
            <path d="M 20 4 L 20 8 M 20 32 L 20 36 M 4 20 L 8 20 M 32 20 L 36 20 M 9 9 L 12 12 M 28 28 L 31 31 M 9 31 L 12 28 M 28 9 L 31 12" />
          </g>
        )}
        {type === 'cloud' && (
          <g stroke="black" strokeWidth="2" fill="white">
            <path d="M 12 28 C 8 28 8 22 12 22 C 12 16 22 14 26 18 C 32 16 34 22 32 26 C 34 28 30 30 26 28 Z" strokeLinejoin="miter" />
          </g>
        )}
        {type === 'rain' && (
          <g stroke="black" strokeWidth="2" fill="white">
            <path d="M 12 24 C 8 24 8 18 12 18 C 12 12 22 10 26 14 C 32 12 34 18 32 22 C 34 24 30 26 26 26 Z" strokeLinejoin="miter" />
            <path d="M 14 30 L 12 34 M 20 30 L 18 34 M 26 30 L 24 34" strokeWidth="2" strokeLinecap="square" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.window}>
        
        <div style={styles.titleBar}>
          <div style={styles.closeBox} />
          <div style={styles.titleLinesLeft} />
          <span style={styles.windowTitle}>METEO v2.2</span>
          <div style={styles.titleLinesRight} />
        </div>

        <div style={styles.content}>
          <div style={styles.dateText}>{today}</div>
          <div style={styles.cityText}>[{CITY_NAME}]</div>
          
          <hr style={styles.separator} />

          {error ? (
            <div style={styles.errorText}>{error}</div>
          ) : (
            <>
              {/* Nouvelle structure en grille alignée */}
              <div style={styles.dashboardGrid}>
                
                {/* ÉTAGE 1 : Les Visuels */}
                <div style={styles.visualRow}>
                  <div style={styles.leftSlot}>
                    <WeatherIcon type={weatherData.icon} size={90} />
                  </div>
                  <div style={styles.rightSlot}>
                    <span style={styles.tempNumber}>
                      {weatherData.temp !== null ? `${weatherData.temp}°` : '--'}
                    </span>
                  </div>
                </div>

                {/* ÉTAGE 2 : Les Textes (Parfaitement alignés sur la ligne de base) */}
                <div style={styles.labelRow}>
                  <div style={styles.leftSlot}>
                    <span style={styles.conditionText}>{weatherData.condition}</span>
                  </div>
                  <div style={styles.rightSlot}>
                    <span style={styles.tempUnit}>TEMPERATURE ACTUELLE</span>
                  </div>
                </div>

              </div>

              <hr style={styles.separatorMini} />

              <div style={styles.forecastContainer}>
                {weatherData.forecast.map((f, index) => (
                  <div key={index} style={styles.forecastCard}>
                    <span style={styles.forecastDay}>{f.day}</span>
                    <div style={styles.miniIconWrapper}>
                      <WeatherIcon type={f.icon} size={46} />
                    </div>
                    <span style={styles.forecastTemp}>
                      {f.tempMax}°C / {f.tempMin}°C
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
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
    overflow: 'hidden', // Interdit le scroll de sécurité
  },
  window: {
    width: '540px',
    height: '420px', // Hauteur forcée pour verrouiller le rendu sous les 480px
    backgroundColor: '#fff',
    border: '2px solid #000',
    boxShadow: '6px 6px 0px #000',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
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
    padding: '12px 25px', // Réduction drastique du padding vertical (de 25px à 12px)
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'space-between', // Répartit les blocs uniformément sans gaspiller de pixels
    boxSizing: 'border-box',
  },
  dateText: {
    fontSize: '13px',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '1.1',
  },
  cityText: {
    fontSize: '18px', // Légèrement réduit pour gagner de la place
    fontWeight: '900',
    marginTop: '2px',
    textAlign: 'center',
    lineHeight: '1',
    letterSpacing: '2px',
  },
  separator: {
    width: '100%',
    border: 'none',
    borderTop: '2px dashed #000',
    margin: '8px 0', // Espacement réduit
  },
  separatorMini: {
    width: '100%',
    border: 'none',
    borderTop: '2px dotted #000',
    margin: '10px 0', // Espacement réduit
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
  
  // Spécifique Horloge Digitale
  digitalDisplay: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    border: '2px solid #000',
    padding: '8px 16px',
    boxShadow: '4px 4px 0px #000',
  },
  digits: {
    fontSize: '38px', // Légèrement réduit de 44px à 38px pour l'écran 480px
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

  // Spécifique Météo
  conditionText: {
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tempNumber: {
    fontSize: '56px', // Réduit de 68px à 56px pour le compactage vertical
    fontWeight: '900',
    lineHeight: '1',
  },
  tempUnit: {
    fontSize: '11px',
    fontWeight: 'bold',
  },
  forecastContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  forecastCard: {
    flex: 1,
    border: '2px solid #000',
    padding: '6px 4px', // Plus compact
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  forecastDay: {
    fontSize: '11px',
    fontWeight: 'bold',
  },
  miniIconWrapper: {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '2px 0',
  },
  forecastTemp: {
    fontSize: '10px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },

  // Spécifique Jauge Horloge
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
    boxSizing: 'border-box',
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: '#000',
  }
};

export default AppleWeather;