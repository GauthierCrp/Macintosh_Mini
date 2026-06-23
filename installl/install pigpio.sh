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