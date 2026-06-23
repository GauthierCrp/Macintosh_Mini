#!/bin/bash
echo "Lancement de MacClock sur le bureau graphique (Plein écran)..."


# Lance le script de surveillance en arrière-plan (&)
./kill_surf.sh &

# Indique à Surf d'utiliser l'écran principal du Pi
DISPLAY=:0 surf -F http://localhost

