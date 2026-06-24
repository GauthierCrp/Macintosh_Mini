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


echo "🔩 8. Déploiement de PIGPIO pré-compilé (Spécial Debian Trixie)..."

# 1. Télechargement des fichiers pré-compilés pour Raspberry Pi2w
wget https://cloud.crepely.fr/index.php/s/yAnGaSWGN3gtK9i/download
tar -xvf download
rm -rf download

echo "🛑 Arrêt du démon pigpiod existant pour libérer le fichier..."
sudo systemctl stop pigpiod 2>/dev/null || true
sudo pkill -9 pigpiod 2>/dev/null || true

# 1. Copie des binaires vers les dossiers système
sudo cp ./pigpio_bin/pigpiod /usr/local/bin/
sudo cp ./pigpio_bin/pigs /usr/local/bin/
sudo cp ./pigpio_bin/libpigpio.so /usr/local/lib/

# 2. Rendre les binaires exécutables
sudo chmod +x /usr/local/bin/pigpiod
sudo chmod +x /usr/local/bin/pigs

# 3. Forcer le système à prendre en compte la nouvelle bibliothèque .so
sudo ldconfig

# 4. Création et configuration du service Systemd avec tes arguments (-x -1)
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

# 5. Activation et démarrage du service
sudo systemctl daemon-reload
sudo systemctl enable pigpiod
sudo systemctl start pigpiod

echo "✅ PIGPIO déployé et démarré !"

# Téléchargement et Installation de l'émulateur MacOS
echo "Création des Répertoires"
mkdir mac_emu
mkdir mac_emu/DISK mac_emu/ROM mac_emu/APP
cd mac_emu
echo "Téléchargement de la ROM"
wget https://cloud.crepely.fr/index.php/s/Yomrc8jQgQRwrPe/download
mv download ./ROM/Mac_LCIII.ROM
echo "Téléchargement de l'image disque MacOS 7.5.3"
wget https://cloud.crepely.fr/index.php/s/k8Yw3cjxCRorS7M/download
cp download ./DISK/DISK1.DSK
rm download
echo "Télécharment du Binaire Pré-compilé de BasiliskII pour PI Zero 2w"
wget https://cloud.crepely.fr/index.php/s/iLswzTxRd3Dfgrf/download
tar -xvf download
rm download
echo "Télechargement du fichier de Configuration BasiliskII"
wget https://cloud.crepely.fr/index.php/s/LHnyRKWHt2954fm/download
cp download MacLCIII_OS7.5.3.prefs
rm download
chmod +x ~/Macintosh_Mini/mac_emu/BasiliskII_app/BasiliskII
chmod +x ~/Macintosh_Mini/launch_basilisk.sh
cd "$PROJECT_ROOT"
export LD_LIBRARY_PATH="$PROJECT_ROOT/mac_emu/BasiliskII_app/libs:$LD_LIBRARY_PATH"


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