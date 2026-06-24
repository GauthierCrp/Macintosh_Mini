# Macintosh Mini 🍏

Ce projet permet de transformer un **Raspberry Pi (Zero 2W / Pi 4)** couplé à un petit écran LCD en un véritable mini-Macintosh rétro fonctionnel. 
Il s'appuie sur l'émulateurs **BasiliskII** pour vous faire revivre System 7.3.5, tout en intégrant un mode display kiosk permettant d'afficher tout au long de la journée, des informations pertinentes : Heure, météo, Now playing si vous avez un serveur Music Assistant sur votre réseau, les stats cpu, disque et mémoire d'un serveur via glances...etc.

## 🚀 Fonctionnalités

* **Gestion 100% prévue pour une utilisation avec un Unique bouton** : Concu pour fonctionner avec l'unique bouton tactile de la MacClock de Ray Clue.
* **Émulation Vintage intégrée** : Configuration pré-paramétrée pour lancer un Macinstosh LCIII avec System 7.3.5. Reste à placer les fichiers disque .dsk et rom dans les dossiers correspondant et lancer l'émulateur.(voir installation)
* **Mode Kiosk Autonome** : Un mode kiosk plein écran avec defilement automatique, permettant d'afficher diverses informations pertinentes tout au long de la journée sur votre mini-Macintosh. Lancement automatique de l'émulation via l'interface web kiosk.
* **Gestion Matérielle Avancée** : Scripts de contrôle de la luminosité et du rétroéclairage de l'écran LCD via le PWM matériel (broche GPIO 18) en s'appuyant sur le démon `pigpio`.
* * **Backend Python pour executer les commandes** : Backend léger via python flask afin d'executer les commandes systemes lancées depuis l ínterface kioks.

---

## 🛠️ Matériel Requis

* Un **Raspberry Pi** (Idéalement Pi Zero 2W pour la taille, ou Pi 4).
* Un **Écran LCD compatible** (ex: Écran Waveshare DPI 2.8 pouces pour le format "Mini Mac").
* Une carte MicroSD configurée sous Raspberry Pi OS (Desktop selon vos configurations X11).

---

## 📦 Dépendances et Installation

### 1. Cloner le projet
Connectez-vous à votre Raspberry Pi en SSH ou ouvrez un terminal et récupérez le dépôt :

git clone https://github.com/GauthierCrp/Macintosh_Mini.git
cd Macintosh_Mini

### 2. Installation via le script fourni
```code
chmod +x install.sh
./install.sh
```
Le script installera, nginx, python3 et téléchargera nvm puis nodeJs V18. Il téléchargera et compilera pigpio. 

## 📂 Structure du Dépôt

* `kill_surf.sh` : Script Bash d'écoute et d'automatisation de fermeture de l'interface de la borne/Mac.