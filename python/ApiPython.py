from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import joblib
from werkzeug.utils import secure_filename
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "https://progressive-overload-4yu0fbvdv-bubusaurios-projects.vercel.app",
    "http://localhost:5173",
    "https://192.168.68.119:5173"
]}})

# Configuración para guardar los videos
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), 'videos'))
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'mp4', 'webm'}

# Diccionario de modelos disponibles (solo necesitamos los modelos, no los label encoders)
MODELOS = {
    'tiron_pecho': os.path.join(os.path.dirname(__file__), 'TironAlPecho.pkl'),
    'bicep': os.path.join(os.path.dirname(__file__), 'bicep.pkl')
    # Agrega más modelos según necesites
}

# Cargar el label encoder (compartido por todos los modelos)
LABEL_ENCODER = joblib.load(os.path.join(os.path.dirname(__file__), 'tiron_pecho_label_encoder.pkl'))  # Asegúrate de que es el mismo para todos

# Configurar el DataFrame para las predicciones
columnas = ["angulo_izq", "angulo_der"]
df_predict = pd.DataFrame(columns=columnas)

# Inicializar MediaPipe
mp_pose = mp.solutions.pose

# Initialize Firebase Admin if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), 'overload-progress-firebase-adminsdk.json'))
    firebase_admin.initialize_app(cred)

db = firestore.client()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_angle(a, b, c):
    ba = a - b
    bc = c - b
    dot_product = np.dot(ba, bc)
    magnitud_ba = np.linalg.norm(ba)
    magnitud_bc = np.linalg.norm(bc)
    angulo_radial = np.arccos(dot_product / (magnitud_ba * magnitud_bc))
    return np.degrees(angulo_radial)

def cargar_modelo(ejercicio):
    """Carga el modelo correspondiente si no está cargado"""
    if ejercicio not in modelos_cargados:
        if ejercicio not in MODELOS:
            raise ValueError(f"Ejercicio {ejercicio} no soportado")
        
        modelo_path = MODELOS[ejercicio]
        modelos_cargados[ejercicio] = joblib.load(modelo_path)
    
    return modelos_cargados[ejercicio]

def process_video(video_path, ejercicio):
    """Procesa el video según el ejercicio especificado"""
    modelo = cargar_modelo(ejercicio)
    
    pose = mp_pose.Pose(static_image_mode=False, 
                       min_detection_confidence=0.5, 
                       min_tracking_confidence=0.5)
    
    bandera = False
    cantidad = 0
    
    cap = cv2.VideoCapture(video_path)
    
    while cap.isOpened():
        ret, frame = cap.read()
        
        if not ret:
            break
        
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)
        
        if results.pose_landmarks:
            height, width, _ = frame.shape
            
            # Puntos clave BRAZO IZQUIERDO
            shoulder_left = results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            elbow_left = results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_ELBOW]
            wrist_left = results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_WRIST]
            
            # Puntos clave BRAZO DERECHO
            shoulder_right = results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            elbow_right = results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            wrist_right = results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            
            # Conversión a píxeles
            shoulder_left_px = np.array([shoulder_left.x * width, shoulder_left.y * height])
            elbow_left_px = np.array([elbow_left.x * width, elbow_left.y * height])
            wrist_left_px = np.array([wrist_left.x * width, wrist_left.y * height])
            
            shoulder_right_px = np.array([shoulder_right.x * width, shoulder_right.y * height])
            elbow_right_px = np.array([elbow_right.x * width, elbow_right.y * height])
            wrist_right_px = np.array([wrist_right.x * width, wrist_right.y * height])
            
            # Calcular ángulos
            angle_left = calculate_angle(shoulder_left_px, elbow_left_px, wrist_left_px)
            angle_right = calculate_angle(shoulder_right_px, elbow_right_px, wrist_right_px)
            
            # Preparar datos para predicción
            df_predict.loc[0] = [angle_left, angle_right]
            
            # Hacer predicción
            prediccion = modelo.predict(df_predict)
            
            # Lógica de conteo (compartida por todos los modelos)
            if prediccion[0] == 2:  # relajado
                bandera = False
            if prediccion[0] == 0 and not bandera:  # levantado
                cantidad += 1
                bandera = True
    
    cap.release()
    return cantidad

# Diccionario para mantener modelos cargados
modelos_cargados = {}

@app.route('/ejercicio', methods=['POST'])
def recibir_video():
    # Permitir procesamiento por filename (nuevo flujo)
    filename = request.form.get('filename')
    ejercicio = request.form.get('ejercicio', 'tiron_pecho')
    if filename:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(filepath):
            return jsonify({"error": "Archivo no encontrado"}), 400
        try:
            repeticiones = process_video(filepath, ejercicio)
            return jsonify({
                "mensaje": "Video procesado exitosamente",
                "ejercicio": ejercicio,
                "nombre_archivo": filename,
                "repeticiones": repeticiones,
                "estado": "success"
            }), 200
        except Exception as e:
            return jsonify({
                "error": f"Error al procesar el video: {str(e)}",
                "estado": "error"
            }), 500
    # Lógica de carga directa (compatibilidad con versiones anteriores)
    if 'video' not in request.files:
        return jsonify({"error": "No se encontró el archivo de video"}), 400
    video = request.files['video']
    if video.filename == '':
        return jsonify({"error": "Nombre de archivo vacío"}), 400
    if video and allowed_file(video.filename):
        filename = secure_filename(video.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        video.save(filepath)
        try:
            repeticiones = process_video(filepath, ejercicio)
            return jsonify({
                "mensaje": "Video procesado exitosamente",
                "ejercicio": ejercicio,
                "nombre_archivo": filename,
                "repeticiones": repeticiones,
                "estado": "success"
            }), 200
        except Exception as e:
            return jsonify({
                "error": f"Error al procesar el video: {str(e)}",
                "estado": "error"
            }), 500
    else:
        return jsonify({
            "error": "Formato no válido, solo se aceptan MP4 o WEBM",
            "estado": "error"
        }), 400

@app.route('/ejercicio', methods=['GET'])
def obtener_ejercicios():
    return jsonify({
        "ejercicios_soportados": list(MODELOS.keys()),
        "mensaje": "Use POST para enviar un video con el parámetro 'ejercicio'"
    })

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({"error": "No se encontró el archivo de video"}), 400
    video = request.files['video']
    if video.filename == '':
        return jsonify({"error": "Nombre de archivo vacío"}), 400
    if video and allowed_file(video.filename):
        filename = secure_filename(video.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        video.save(filepath)
        return jsonify({"mensaje": "Archivo subido exitosamente", "filename": filename}), 200
    else:
        return jsonify({"error": "Formato no válido, solo se aceptan MP4 o WEBM"}), 400

@app.route('/overhead-press', methods=['POST'])
def test_video():
    data = request.get_json()
    filename = data.get('filename')
    ejercicio = data.get('ejercicio', 'tiron_pecho')
    if not filename:
        return jsonify({"error": "Se requiere el nombre del archivo (filename)"}), 400
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404
    try:
        repeticiones = process_video(filepath, ejercicio)
        return jsonify({
            "mensaje": "Video procesado exitosamente (test)",
            "ejercicio": ejercicio,
            "nombre_archivo": filename,
            "repeticiones": repeticiones,
            "estado": "success"
        }), 200
    except Exception as e:
        return jsonify({
            "error": f"Error al procesar el video: {str(e)}",
            "estado": "error"
        }), 500

@app.route('/bicep-curl', methods=['POST'])
def bicep_curl():
    data = request.get_json()
    filename = data.get('filename')
    ejercicio = data.get('ejercicio', 'bicep')
    if not filename:
        return jsonify({"error": "Se requiere el nombre del archivo (filename)"}), 400
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404
    try:
        repeticiones = process_video(filepath, ejercicio)
        return jsonify({
            "mensaje": f"Video {filename} procesado exitosamente (bicep-curl)",
            "ejercicio": ejercicio,
            "nombre_archivo": filename,
            "repeticiones": repeticiones,
            "estado": "success"
        }), 200
    except Exception as e:
        return jsonify({
            "error": f"Error al procesar el video: {str(e)}",
            "estado": "error"
        }), 500

@app.route('/save_bpm', methods=['POST'])
def save_bpm():
    data = request.get_json()
    user_id = data.get('user_id')
    bpm = data.get('bpm')
    date = data.get('date') or datetime.now().strftime('%m/%d/%Y')
    if not user_id or bpm is None:
        return jsonify({'error': 'user_id and bpm are required'}), 400
    try:
        doc_ref = db.collection('bpmHistory').document()
        doc_ref.set({
            'userId': user_id,
            'bpm': bpm,
            'date': date
        })
        return jsonify({'message': 'BPM data saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_selected_exercise', methods=['POST'])
def update_selected_exercise():
    data = request.get_json()
    user_id = data.get('userId')
    exercise = data.get('exercise')
    if not user_id or not exercise:
        return jsonify({'error': 'userId and exercise are required'}), 400
    try:
        doc_ref = db.collection('selectedExercise').document(user_id)
        doc_ref.set({'exercise': exercise}, merge=True)
        return jsonify({'message': 'Selected exercise updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5050)