#!/bin/bash


#####INSTALLATION du Navigateur et Serveur WEB
sudo apt install -y surf nginx python3


#####INSTALLATION de nvm
# 1. Téléchargement et exécution du script d'installation officiel de NVM (v0.39.7)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 2. Recharger le profil du terminal pour activer NVM immédiatement sans se déconnecter
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 3. Vérification que NVM est bien installé
nvm --version