// src/config.js

export const CONFIG = {

  // 1. MONITORING SYSTEME (Glances - Utilisé par MacStat.jsx)
glances: {
    serverIp: "10.194.6.220",
    port: "61208",
    get apiUrl() {
      return `http://${this.serverIp}:${this.port}/api/4/all`;
    },
    refreshIntervalMs: 5000
  },


  // 2. SERVEUR AUDIO (Music Assistant - Utilisé par MacNowPlaying.jsx)
  musicAssistant: {
    serverIp: "192.168.100.106",
    port: "8095",
    targetPlayerName: "Streamer_Bureau",
    credentials: {
      username: "gauthier",
      password: "grelcrp!!"
    }
  },


  // 3. ENVIRONNEMENT & METEO (Bruz / Région Rennaise - Utilisé par AppleWeather.jsx)
  weather: {
    cityName: "RENNES", // Ville affichée par défaut
    latitude: 48.083328,
    longitude: -1.683330,
    // Base de l'URL Open-Meteo utilisée dans ton composant
    baseUrl: "https://api.open-meteo.com/v1/forecast"
  },

  
// 4. FLUX D'ACTUALITES (RSS - Utilisé par MacNews.jsx)
  news: {
    rssUrl: "https://www.lemonde.fr/international/rss_full.xml",
    get apiJsonUrl() {
      return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(this.rssUrl)}`;
    }
  },

  // 5. PARAMETRES DU SYSTEME MINI-MAC
system: {
    version: "1.6",
    theme: "mac-classic-1bit",
    defaultInterval: 30, // Durée par défaut (en secondes) si non spécifiée
    intervals: {
      happy: 10,    // 10 secondes sur l'écran d'accueil
      paint: 10,    // 10 secondes sur Apple Paint
      weather: 15,  // 15 secondes sur la Météo
      playing: 40,  // 40 secondes sur le Lecteur de musique
      clock: 12,    // 12 secondes sur l'Horloge
      news: 60,     // 60 secondes sur le Téléscripteur (plus long pour lire)
      stats: 20     // 20 secondes sur le Moniteur système
    }
  }
};