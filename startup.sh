#!/bin/bash
echo "Lancement de MacClock sur le bureau"

# Lance le script de surveillance en arrière-plan (&)
nohup ./.venv/bin/python3 ./src/server.py > server.log 2>&1 &

# Indique à Surf d'utiliser l'écran principal du Pi
DISPLAY=:0 surf -F http://localhost

