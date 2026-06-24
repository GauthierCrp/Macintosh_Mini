// src/config.template.js

export const CONFIG = {
  // 1. MONITORING SYSTEME (Glances - Utilisé par MacStat.jsx)
  glances: {
    serverIp: "__GLANCES_IP__",
    port: "__GLANCES_PORT__",
    get apiUrl() {
      return `http://${this.serverIp}:${this.port}/api/4/all`;
    },
    refreshIntervalMs: 5000
  },

  // 2. SERVEUR AUDIO (Music Assistant - Utilisé par MacNowPlaying.jsx)
  musicAssistant: {
    serverIp: "__MA_IP__",
    port: "__MA_PORT__",
    targetPlayerName: "__MA_PLAYER__",
    credentials: {
      username: "__MA_USER__",
      password: "__MA_PWD__"
    }
  },

  // 3. ENVIRONNEMENT & METEO (Bruz / Région Rennaise - Utilisé par AppleWeather.jsx)
  weather: {
    cityName: "__WEATHER_CITY__",
    latitude: __WEATHER_LAT__,
    longitude: __WEATHER_LON__,
    baseUrl: "https://api.open-meteo.com/v1/forecast"
  },

  // 4. FLUX D'ACTUALITES (RSS - Utilisé par MacNews.jsx)
  news: {
    rssUrl: "__NEWS_RSS__",
    get apiJsonUrl() {
      return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(this.rssUrl)}`;
    }
  },

  // 5. PARAMETRES DU SYSTEME MINI-MAC
  system: {
    version: "__SYS_VERSION__",
    theme: "__SYS_THEME__",
    defaultInterval: 30,
    intervals: {
      happy: 10,
      paint: 10,
      weather: 15,
      playing: 40,
      clock: 12,
      news: 60,
      stats: 20
    }
  }
};