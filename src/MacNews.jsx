import React, { useState, useEffect } from 'react';
import { CONFIG } from './config';

const MacNews = () => {
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API de conversion RSS2JSON stable et gratuite pour récupérer Le Monde en Français
  const RSS_LE_MONDE = "https://www.lemonde.fr/international/rss_full.xml";
  const NEWS_URL = CONFIG.news.apiJsonUrl;

  useEffect(() => {
    const fetchNews = () => {
      fetch(NEWS_URL)
        .then((res) => {
          if (!res.ok) throw new Error('SERVEUR DE PRESSE INDISPONIBLE');
          return res.json();
        })
        .then((resData) => {
          if (resData.status === 'ok' && resData.items && resData.items.length > 0) {
            // Nettoyage et passage en MAJUSCULES pour le look rétro
            const validArticles = resData.items.map(art => {
              // Nettoyer les reliquats HTML si présents dans le titre
              let cleanTitle = art.title.replace(/<\/?[^>]+(>|$)/g, "");
              // Raccourcir si le titre est anormalement long
              if (cleanTitle.length > 120) cleanTitle = cleanTitle.substring(0, 117) + "...";

              return {
                title: cleanTitle.toUpperCase(),
                source: "LE MONDE",
                link: art.link
              };
            });
            
            setArticles(validArticles);
            setError(null);
          } else {
            throw new Error('FLUX ACTU VIDE OU INDISPONIBLE');
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    };

    fetchNews();
    // Rafraîchissement toutes les 15 minutes
    const newsTimer = setInterval(fetchNews, 900000);
    return () => clearInterval(newsTimer);
  }, [NEWS_URL]);

  // Boucle de rotation du titre central (10 secondes par flash info)
  useEffect(() => {
    if (articles.length <= 1) return;
    const rotateTimer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % articles.length);
    }, 10000);
    return () => clearInterval(rotateTimer);
  }, [articles]);

  const currentArticle = articles[currentIndex];

  // Construction du texte du téléscripteur (bandeau du bas)
  const tickerText = articles.length > 0 
    ? articles.map(art => `*** ${art.source} : ${art.title} `).join(' ') 
    : "CHARGEMENT DES DEPECHES EN COURS...";

  return (
    <div style={styles.container}>
      <div style={styles.window}>
        
        {/* Barre de titre Mac OS */}
        <div style={styles.titleBar}>
          <div style={styles.closeBox} />
          <div style={styles.titleLinesLeft} />
          <span style={styles.windowTitle}>TELESCREPAR v1.1</span>
          <div style={styles.titleLinesRight} />
        </div>

        {/* Corps de l'application */}
        <div style={styles.content}>
          
          {loading ? (
            <div style={styles.centerStatus}>
              <span style={styles.blinkText}>RECHERCHE DU SIGNAL...</span>
            </div>
          ) : error ? (
            <div style={styles.errorContainer}>
              <span style={styles.errorText}>[!] ERREUR TELESCREPAR</span>
              <span style={styles.errorSubText}>{error}</span>
              <span style={styles.errorHint}>VÉRIFIE LA CONNEXION DE TA MACHINE</span>
            </div>
          ) : (
            <>
              {/* En-tête : Source et Métadonnées */}
              <div style={styles.metaHeader}>
                <span style={styles.metaText}>DEPECHE : {currentIndex + 1} / {articles.length}</span>
                <span style={styles.metaText}>SOURCE : {currentArticle?.source}</span>
              </div>

              <hr style={styles.separator} />

              {/* Centre : Le Gros Titre en Français */}
              <div style={styles.headlineContainer}>
                <p style={styles.headlineText}>
                  {currentArticle?.title}
                </p>
              </div>

              <hr style={styles.separatorMini} />

              {/* Bas : Le ruban défilant */}
              <div style={styles.tickerContainer}>
                <div style={styles.tickerWrapper}>
                  <div style={styles.tickerContent}>
                    {tickerText} {tickerText}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Style CSS de l'animation de défilement */}
      <style>{`
        @keyframes macMarquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}
      {`
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important; /* Tue définitivement le scroll de page */
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
      `}
      </style>
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
    padding: '12px 20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  metaHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  metaText: {
    letterSpacing: '0.5px',
  },
  separator: {
    width: '100%',
    border: 'none',
    borderTop: '2px dashed #000',
    margin: '4px 0',
  },
  separatorMini: {
    width: '100%',
    border: 'none',
    borderTop: '2px dotted #000',
    margin: '4px 0',
  },
  centerStatus: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
  blinkText: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  headlineContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5px 10px',
    textAlign: 'center',
    minHeight: '200px',
  },
  headlineText: {
    fontSize: '18px', // Ajusté pour le français (mots souvent plus longs qu'en anglais)
    fontWeight: '900',
    lineHeight: '1.4',
    margin: 0,
    textTransform: 'uppercase',
    wordBreak: 'break-word',
  },
  tickerContainer: {
    width: '100%',
    height: '38px',
    border: '2px solid #000',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    boxShadow: '3px 3px 0px #000',
  },
  tickerWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  tickerContent: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    paddingLeft: '100%',
    fontSize: '13px',
    fontWeight: 'bold',
    animation: 'macMarquee 130s linear infinite', // Légèrement ralenti pour une meilleure lecture
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    flexGrow: 1,
    border: '2px dashed #000',
  },
  errorText: {
    fontSize: '14px',
    fontWeight: '900',
  },
  errorSubText: {
    fontSize: '11px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorHint: {
    fontSize: '9px',
    color: '#666',
  }
};

export default MacNews;