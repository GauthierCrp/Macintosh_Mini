#!/bin/bash

# Couleurs pour le terminal
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0;37m' # Pas de couleur

echo -e "${CYAN}==================================================${NC}"
echo -e "${CYAN}🛠️  CONFIGURATION DE L'APPLICATION MINI-MAC       ${NC}"
echo -e "${CYAN}==================================================${NC}"
echo ""

# S'assurer que le template existe
if [ ! -f "src/config.template.js" ]; then
    echo -e "❌ Erreur : Le fichier 'src/config.template.js' est introuvable."
    exit 1
fi

# --- 1. COLLECTE DES PARAMÈTRES (Avec valeurs par défaut) ---

echo -e "${YELLOW}[1/4] Suivi Système (Glances)${NC}"
read -p "❓ Adresse IP du serveur Glances [10.194.6.220] : " glances_ip
glances_ip=${glances_ip:-10.194.6.220}
read -p "❓ Port de Glances [61208] : " glances_port
glances_port=${glances_port:-61208}

echo ""
echo -e "${YELLOW}[2/4] Serveur Audio (Music Assistant)${NC}"
read -p "❓ Adresse IP Music Assistant [192.168.100.106] : " ma_ip
ma_ip=${ma_ip:-192.168.100.106}
read -p "❓ Port Music Assistant [8095] : " ma_port
ma_port=${ma_port:-8095}
read -p "❓ Nom du lecteur cible [Streamer_Bureau] : " ma_player
ma_player=${ma_player:-Streamer_Bureau}
read -p "❓ Nom d'utilisateur [gauthier] : " ma_user
ma_user=${ma_user:-gauthier}
read -p "❓ Mot de passe [grelcrp!!] : " ma_pwd
ma_pwd=${ma_pwd:-grelcrp!!}

echo ""
echo -e "${YELLOW}[3/4] Environnement & Météo${NC}"
read -p "❓ Ville par défaut [RENNES] : " weather_city
weather_city=${weather_city:-RENNES}
read -p "❓ Latitude [48.083328] : " weather_lat
weather_lat=${weather_lat:-48.083328}
read -p "❓ Longitude [-1.683330] : " weather_lon
weather_lon=${weather_lon:--1.683330}

echo ""
echo -e "${YELLOW}[4/4] Flux d'actualités & Système${NC}"
read -p "❓ Flux RSS d'actualités [Le Monde International] : " news_rss
news_rss=${news_rss:-https://www.lemonde.fr/international/rss_full.xml}
read -p "❓ Version de l'application [1.6] : " sys_version
sys_version=${sys_version:-1.6}
read -p "❓ Thème par défaut [mac-classic-1bit] : " sys_theme
sys_theme=${sys_theme:-mac-classic-1bit}

# --- 2. GENERATION DU FICHIER CONFIG.JS ---

echo ""
echo -e "✍️  Génération du fichier ${GREEN}src/config.js${NC}..."

# Copie le template vers le fichier final
cp src/config.template.js src/config.js

# Remplacement des balises par les réponses de l'utilisateur
# Utilisation de | comme délimiteur dans sed pour éviter les conflits avec les slashs des URLs
sed -i "s|__GLANCES_IP__|$glances_ip|g" src/config.js
sed -i "s|__GLANCES_PORT__|$glances_port|g" src/config.js
sed -i "s|__MA_IP__|$ma_ip|g" src/config.js
sed -i "s|__MA_PORT__|$ma_port|g" src/config.js
sed -i "s|__MA_PLAYER__|$ma_player|g" src/config.js
sed -i "s|__MA_USER__|$ma_user|g" src/config.js
sed -i "s|__MA_PWD__|$ma_pwd|g" src/config.js
sed -i "s|__WEATHER_CITY__|$weather_city|g" src/config.js
sed -i "s|__WEATHER_LAT__|$weather_lat|g" src/config.js
sed -i "s|__WEATHER_LON__|$weather_lon|g" src/config.js
sed -i "s|__NEWS_RSS__|$news_rss|g" src/config.js
sed -i "s|__SYS_VERSION__|$sys_version|g" src/config.js
sed -i "s|__SYS_THEME__|$sys_theme|g" src/config.js

echo -e "✅ Fichier ${GREEN}src/config.js${NC} mis à jour avec succès !"

# --- 3. RECOMPILATION DE L'APPLICATION ---

echo ""
echo -e "📦 Lancement de la compilation (${CYAN}npm run build${NC})..."
echo "--------------------------------------------------"

if npm run build; then
    echo "--------------------------------------------------"
    echo -e "${GREEN}🎉 Compilation terminée avec succès !${NC}"
    echo -e "🚀 Vos modifications sont prêtes à être déployées."
else
    echo "--------------------------------------------------"
    echo -e "❌ Échec de la compilation. Vérifiez les erreurs ci-dessus."
    exit 1
fi

echo "📁 Copie des fichiers à servir vers Nginx (/var/www/html)..."
sudo rm -rf /var/www/html/*
sudo cp -r ./dist/* /var/www/html/ 

echo "Suppression du cache de Surf"
sudo rm -rf ~/surf

echo "🔄 Redémarrage de Nginx..."
sudo systemctl restart nginx

echo -e "✅ Fichier ${GREEN}src/config.js${NC} mis à jour avec succès !"
exit 0