#!/bin/bash
# 1. Fermer le navigateur Surf
pkill surf
sleep 1

# Trouve dynamiquement le dossier racine (MacClassic) où se situe ce script
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Définition des chemins exacts selon ton arborescence VS Code
EMU_DIR="$ROOT_DIR/mac_emu"
BASILISK_APP_DIR="$EMU_DIR/BasiliskII_app"

# 2. Injecter le dossier libs qui est dans BasiliskII_app
export LD_LIBRARY_PATH="$BASILISK_APP_DIR/libs:$LD_LIBRARY_PATH"

# 3. Lancer le binaire en ciblant la bonne config MacLCIII_OS7.5.3.prefs
"$BASILISK_APP_DIR/BasiliskII" --config "$EMU_DIR/MacLCIII_OS7.5.3.prefs"

# 4. Relancer Surf une fois l'émulateur quitté
DISPLAY=:0 surf -F http://localhost:3000 &