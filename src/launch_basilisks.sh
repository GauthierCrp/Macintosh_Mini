#!/bin/bash

# 1. Fermer le navigateur Surf
# On utilise pkill pour fermer toutes les instances de Surf
pkill surf
sleep 1 # Petit temps d'arrêt pour laisser l'affichage se libérer

# 2. Lancer BasiliskII en plein écran
# Le script va bloquer sur cette ligne tant que l'émulateur est ouvert
BasiliskII --config ~/MacClock/Mac7.5.3/MacII_OS7.5.3.prefs

# 3. Code exécuté UNIQUEMENT quand BasiliskII est fermé par l'utilisateur :
# Relancer Surf en plein écran sur ton interface locale
# Note : Ajuste l'URL (ex: http://localhost:3000) selon ton port d'affichage web
DISPLAY=:0 surf -F http://localhost:3000 &