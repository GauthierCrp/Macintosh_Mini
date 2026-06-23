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

git clone https://github.com/GauthierCrp/Macintosh_Mini.git
cd Macintosh_Mini

### 2. Installer les packages système requis
Le projet utilise des outils de manipulation de fenêtres X11 et de gestion des broches GPIO.

sudo apt update
sudo apt install xdotool xprop surf pigpio python3-pip -y

### 3. Activer le démon pigpio
Pour que le contrôle du PWM (GPIO 18) fonctionne via `pigs`, le démon doit être actif au démarrage :

sudo systemctl enable pigpiod
sudo systemctl start pigpiod

---

## 🔧 Configuration et Utilisation

### Gestion de l'affichage (Kiosk & Auto-Kill)
Le script `kill_surf.sh` permet de surveiller l'application Kiosk et de la couper proprement de manière événementielle (par exemple, suite à une action JavaScript émise par l'application web comme un triple-clic).

Pour lancer le script de surveillance en arrière-plan :

./kill_surf.sh &

### Piloter le rétroéclairage (GPIO 18 / PWM)
Si vous utilisez la bibliothèque `pigpio` (`pigs`), vous pouvez faire varier l'intensité de la broche 18 (PWM matériel lié à l'écran) :

# Configurer la pin 18 en mode Écriture (Sortie)
pigs m 18 w

# Régler la luminosité à 50% (Valeur entre 0 et 255)
pigs p 18 128

# Éteindre complètement
pigs w 18 0

---

## 📂 Structure du Dépôt

* `kill_surf.sh` : Script Bash d'écoute et d'automatisation de fermeture de l'interface de la borne/Mac.

---

## 📜 Licence
Ce projet est open-source. N'hésitez pas à le forker et à l'adapter à vos propres boîtiers de Mini-Mac !