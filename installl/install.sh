#!/bin/bash

sudo apt update

#####INSTALLATION du Navigateur et Serveur WEB
sudo apt install -y surf nginx 

#####INSTALLTION de Python3
sudo  apt install -y python3 python3-pip python3-venv

python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip

echo "📚 5. Installation des dépendances depuis requirements.txt..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo "✅ Dépendances installées avec succès !"
else
    echo "⚠️ Attention : Fichier requirements.txt introuvable à la racine."
fi

echo "🎉 Configuration Python terminée !"


echo "Installation de NVM"

#####INSTALLATION de nvm
# 1. Téléchargement et exécution du script d'installation officiel de NVM (v0.39.7)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 2. Recharger le profil du terminal pour activer NVM immédiatement sans se déconnecter
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 3. Vérification que NVM est bien installé
echo "installation de NVM terminé version :"
nvm --version

######INSTALLATION de PIGPIO

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
sudo systemctl stop rgpiod 2>/dev/null
sudo systemctl disable rgpiod 2>/dev/null

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

[Unit]
WantedBy=multi-user.target
SERVICE

# Rechargement et activation du service
sudo systemctl daemon-reload
sudo systemctl enable pigpiod
sudo systemctl start pigpiod

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN} Installation terminée avec succès !${NC}"
echo -e "${GREEN} Le démon pigpiod tourne en tâche de fond.${NC}"
echo -e "${GREEN} Tu peux tester immédiatement avec : pigs p 18 128${NC}"
echo -e "${GREEN}====================================================${NC}"
EOF

# Rendre le script exécutable et le lancer
chmod +x setup_pigpio.sh
./setup_pigpio.sh


######Déployer le serveur Web et lancer l'application

#####Install les dependannce NPM
npm install

#####Compile la versions vers /dist
npm run built

#####Copie des fichiers a servir vers Nginx (/var/www/htm;)
sudo cp -r ./dist/* /var/www/html/ 

#####Redemmarage de Nginx
sudo systemctl restart nginx

#####Demarrage de l'interface
cd ..
sudo chmod +x ./startup.sh
./startup.sh

