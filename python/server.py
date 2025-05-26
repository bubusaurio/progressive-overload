from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin SDK with your service account key JSON
cred = credentials.Certificate("python/overload-progress-firebase-adminsdk.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)

@app.route('/lastProgression', methods=['GET'])
def last_progression():
    muscle_group_id = request.args.get('muscleGroupId')
    exercise_id = request.args.get('exerciseId')

    if not muscle_group_id or not exercise_id:
        return jsonify({"error": "muscleGroupId and exerciseId parameters are required"}), 400

    try:
        progression_ref = (
            db.collection("muscleGroups")
              .document(muscle_group_id)
              .collection("exercises")
              .document(exercise_id)
              .collection("progressionHistory")
        )

        query = progression_ref.order_by("date", direction=firestore.Query.DESCENDING).limit(1)
        results = query.stream()

        last_entry = None
        for doc in results:
            last_entry = doc.to_dict()
            last_entry["id"] = doc.id

        if last_entry:
            return jsonify(last_entry)
        else:
            return jsonify({"message": "No progression entries found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run on all interfaces so ESP32 can reach it
    app.run(host='0.0.0.0', port=5003)