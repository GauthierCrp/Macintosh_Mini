#!/bin/bash

# Interrompt le script immédiatement si une commande échoue
set -e

# Sauvegarde du dossier racine actuel de la borne
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔄 1. Mise à jour des paquets système..."
sudo apt update

echo "🌐 2. Installation du Navigateur (Surf) et du Serveur WEB (Nginx)..."
sudo apt install -y surf nginx 

echo "📦 3. Installation de Python 3 et de ses outils d'environnement..."
sudo apt install -y python3 python3-pip python3-venv

echo "📁 4. Création et configuration de l'environnement virtuel (.venv)..."
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip

echo "📚 5. Installation des dépendances Python depuis requirements.txt..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo "✅ Dépendances installées avec succès !"
else
    echo "⚠️ Attention : Fichier requirements.txt introuvable à la racine."
fi

echo "🎉 Configuration Python terminée !"


echo "📥 6. Installation et configuration de NVM (Node Version Manager)..."
# Téléchargement et exécution du script d'installation officiel de NVM (v0.39.7)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Recharger l'environnement NVM immédiatement pour le script courant
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

echo "✅ Installation de NVM terminée. Version :"
nvm --version

echo "🟢 7. Installation de Node.js v18 (Version légère recommandée)..."
nvm install 18
nvm use 18
nvm alias default 18

echo "✅ Vérification de NPM. Version :"
npm --version


echo "🔩 8. Configuration et compilation de PIGPIO..."
cat << 'EOF' > setup_pigpio.sh
#!/bin/bash

# Couleurs pour le suivi dans le terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}[1/5] Mise à jour des paquets et installation des outils de build...${NC}"
sudo apt update
sudo apt install -y build-essential wget unzip

echo -e "${GREEN}[2/5] Nettoyage et désactivation de rgpiod (conflit potentiel)...${NC}"
sudo systemctl stop rgpiod 2>/dev/null || true
sudo systemctl disable rgpiod 2>/dev/null || true

echo -e "${GREEN}[3/5] Vérification et récupération de pigpio V79...${NC}"
cd ~

if [ -f "pigpio-v79.tar.gz" ]; then
    echo -e "${YELLOW}-> L'archive pigpio-v79.tar.gz est déjà présente localement. Téléchargement ignoré.${NC}"
else
    echo -e "-> Téléchargement de la version 79 officielle..."
    wget https://github.com/joan2937/pigpio/archive/v79.tar.gz -O pigpio-v79.tar.gz
fi

# Nettoyage d'un ancien dossier d'extraction pour repartir sur du propre
if [ -d "pigpio-79" ]; then
    rm -rf pigpio-79
fi

echo -e "-> Extraction de l'archive..."
tar -xzvf pigpio-v79.tar.gz
cd pigpio-79

echo -e "${GREEN}[4/5] Compilation et installation (cela peut prendre 1 à 2 minutes)...${NC}"
make
sudo make install

echo -e "${GREEN}[5/5] Configuration et activation du service pigpiod au démarrage...${NC}"
# Création d'un service Systemd propre pour lancer pigpiod avec les accès étendus (-x -1)
sudo tee /etc/systemd/system/pigpiod.service > /dev/null << 'SERVICE'
[Unit]
Description=Daemon required for pigpio
After=network.target

[Service]
ExecStart=/usr/local/bin/pigpiod -x -1
Type=forking

[Install]
WantedBy=multi-user.target
SERVICE

# Rechargement et activation du service
sudo systemctl daemon-reload
sudo systemctl enable pigpiod
sudo systemctl start pigpiod

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN} Installation pigpio terminée avec succès !         ${NC}"
echo -e "${GREEN}====================================================${NC}"
EOF

# Rendre le script pigpio exécutable et le lancer
chmod +x setup_pigpio.sh
./setup_pigpio.sh

# Nettoyage du sous-script temporaire
rm setup_pigpio.sh


echo "🚀 9. Déploiement du serveur Web et lancement de l'application..."

# RETOUR SÉCURISÉ au dossier d'origine de la borne (évite les erreurs de dossiers perdus)
cd "$PROJECT_ROOT"

echo "📦 Installation des dépendances NPM..."
npm install

echo "🏗️ Compilation du Frontend vers /dist..."
npm run build

echo "📁 Copie des fichiers à servir vers Nginx (/var/www/html)..."
sudo rm -rf /var/www/html/*
sudo cp -r ./dist/* /var/www/html/ 

echo "🔄 Redémarrage de Nginx..."
sudo systemctl restart nginx

echo "🖥️ Préparation et exécution du script de démarrage de la borne..."
if [ -f "./startup.sh" ]; then
    sudo chmod +x ./startup.sh
    ./startup.sh
else
    echo "❌ Erreur : ./startup.sh introuvable à la racine de la borne."
    exit 1
fi