import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def change_brightness(percent):
    try:
        pigs_value = int((percent / 100.0) * 255)
        subprocess.run(["pigs", "p", "18", str(pigs_value)], check=True)
        print(f"[Hardware] Luminosité réglée à {percent}% (pigs p 18 {pigs_value})")
        return True
    except (subprocess.SubprocessError, FileNotFoundError) as e:
        print(f"Erreur lors de l'exécution de pigs : {e}")
        return False

@app.route('/api/system', methods=['POST'])
def handle_system():
    data = request.json or {}
    req_type = data.get('type')
    value = data.get('value')

    if req_type == 'brightness':
        if change_brightness(int(value)):
            return jsonify({"status": "success"})
        return jsonify({"status": "error", "message": "Échec de la commande pigs"}), 500

    elif req_type == 'system':
        if value == 'kill_surf':
            print("Action : Fermeture de Surf...")
            subprocess.Popen(["pkill", "surf"])
            return jsonify({"status": "success", "message": "Fermeture de Surf"})

        elif value == 'reboot':
            print("Action : Redémarrage...")
            subprocess.Popen(["sudo", "/sbin/reboot"])
            return jsonify({"status": "success", "message": "Reboot en cours"})
            
        elif value == 'shutdown':
            print("Action : Arrêt...")
            subprocess.Popen(["sudo", "/sbin/poweroff"])
            return jsonify({"status": "success", "message": "Shutdown en cours"})

    return jsonify({"status": "error", "message": "Action inconnue"}), 400

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False, threaded=False)