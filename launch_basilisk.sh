#!/bin/bash
# 1. Fermer le navigateur Surf
pkill surf
sleep 1

# Trouve dynamiquement le dossier racine où se situe ce script
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Définition des chemins exacts selon ton arborescence
EMU_DIR="$ROOT_DIR/mac_emu"
BASILISK_APP_DIR="$EMU_DIR/BasiliskII_app"

# 2. Sécurité : On se positionne à la racine du projet pour valider les chemins relatifs du .prefs
cd "$ROOT_DIR"

# 🔥 AJOUT : Export de la variable pour charger les libs locales situées à côté du binaire
export LD_LIBRARY_PATH="$BASILISK_APP_DIR/libs:$LD_LIBRARY_PATH"

# 3. Lancer le binaire en ciblant la bonne config (via les variables dynamiques)
DISPLAY=:0 "$BASILISK_APP_DIR/BasiliskII" --config "$EMU_DIR/MacLCIII_OS7.5.3.prefs"

# 4. Relancer Surf une fois l'émulateur quitté
DISPLAY=:0 surf -F http://localhost &