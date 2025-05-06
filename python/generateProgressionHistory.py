import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase Admin
cred = credentials.Certificate("python/overload-progress-firebase-adminsdk.json") 
firebase_admin.initialize_app(cred)

db = firestore.client()

# Ask for user input
user_id = input("Enter User ID: ")
muscle_group_id = input("Enter Muscle Group ID (e.g., chest, back): ")
exercise_id = input("Enter Exercise ID (e.g., bench-press): ")

try:
    weight = float(input("Enter weight lifted (kg): "))
    reps = int(input("Enter number of reps: "))
    sets = int(input("Enter number of sets: "))
    notes = input("Any notes? (optional): ")
except ValueError as e:
    print("Invalid input. Please enter numbers where required.")
    exit(1)

# Prepare progression data
progression_data = {
    "date": datetime.now().strftime("%m/%d/%Y"),
    "weight": weight,
    "reps": reps,
    "sets": sets,
    "userId": user_id
}

if notes.strip():
    progression_data["notes"] = notes

# Save to Firestore
doc_ref = db.collection("muscleGroups") \
            .document(muscle_group_id) \
            .collection("exercises") \
            .document(exercise_id) \
            .collection("progressionHistory") \
            .document() 

doc_ref.set(progression_data)

print(f"\n✅ Progression data saved for exercise '{exercise_id}' under muscle group '{muscle_group_id}'.")