# Macintosh Mini 🍏

Ce projet permet de transformer un **Raspberry Pi (Zero 2W / Pi 4)** couplé à un petit écran LCD en un véritable mini-Macintosh rétro fonctionnel. Il s'appuie sur des émulateurs comme **Mini vMac** ou **BasiliskII** pour faire revivre le Système 6 ou 7, tout en intégrant des scripts d'automatisation et de gestion matérielle (rétroéclairage, extinction propre, contrôle Kiosk).

## 🚀 Fonctionnalités

* **Émulation Vintage intégrée** : Configuration optimisée pour System 6 / System 7 (Mac Classic, Mac II).
* **Mode Kiosk Autonome** : Lancement automatique de l'interface d'émulation ou d'une interface web dédiée (via le navigateur minimaliste `surf`) dès le démarrage du Raspberry Pi.
* **Surveillance Événementielle (Script de fermeture)** : Un script Bash léger (`kill_surf.sh`) basé sur `xdotool` et `xprop` surveille passivement l'environnement pour fermer proprement l'interface sans surcharger le processeur (0% CPU au repos).
* **Gestion Matérielle Avancée** : Scripts de contrôle de la luminosité et du rétroéclairage de l'écran LCD via le PWM matériel (broche GPIO 18) en s'appuyant sur le démon `pigpio`.

---

## 🛠️ Matériel Requis

* Un **Raspberry Pi** (Idéalement Pi Zero 2W pour la taille, ou Pi 4).
* Un **Écran LCD compatible** (ex: Écran SPI 2.8 pouces pour le format "Mini Mac").
* Une carte MicroSD configurée sous Raspberry Pi OS (Lite ou Desktop selon vos configurations X11).

---

## 📦 Dépendances et Installation

### 1. Cloner le projet
Connectez-vous à votre Raspberry Pi en SSH ou ouvrez un terminal et récupérez le dépôt :
```bash
git clone [https://github.com/GauthierCrp/Macinstosh_Mini.git](https://github.com/GauthierCrp/Macinstosh_Mini.git)
cd Macinstosh_Mini