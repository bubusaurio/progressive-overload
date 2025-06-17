import React, { useRef, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const API_URL = "http://localhost:5050/ejercicio"; // Adjust if your Flask API runs elsewhere

const VideoRecorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [weight, setWeight] = useState<string>("");

  // Start camera and recording
  const startRecording = async () => {
    setResult(null);
    setVideoBlob(null);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.src = ""; // Clear any previous src
      videoRef.current.play();
    }
    // Try to use webm, fallback to default if not supported
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    } catch (e) {
      recorder = new MediaRecorder(stream);
    }
    let chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setVideoBlob(blob);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = URL.createObjectURL(blob);
      }
      stream.getTracks().forEach((track) => track.stop());
    };
    mediaRecorderRef.current = recorder;
    setRecording(true);
    recorder.start();
  };

  // Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // Upload video to Flask API (step 1)
  const uploadVideo = async () => {
    if (!videoBlob) return;
    setUploading(true);
    setResult(null);
    const formData = new FormData();
    const file = new File([videoBlob], "video.webm", { type: "video/webm" });
    formData.append("video", file, file.name);

    try {
      // Step 1: Upload the file
      const uploadRes = await fetch("http://localhost:5050/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setResult({ error: uploadData.error || "Upload failed" });
        setUploading(false);
        return;
      }
      // Step 2: Process the uploaded file
      const processRes = await fetch(API_URL, {
        method: "POST",
        body: new URLSearchParams({
          ejercicio: "tiron_pecho",
          filename: uploadData.filename,
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const processData = await processRes.json();
      setResult(processData);
    } catch (e) {
      setResult({ error: "Upload or processing failed" });
    }
    setUploading(false);
  };

  // Send overhead
  const overheadPress = async () => {
    if (!videoBlob) return;
    setUploading(true);
    setResult(null);
    const formData = new FormData();
    const file = new File([videoBlob], "overhead-press.mp4", { type: "video/mp4" });
    formData.append("video", file, file.name);
    try {
      // Upload the file first (if not already uploaded)
      const uploadRes = await fetch("http://localhost:5050/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setResult({ error: uploadData.error || "Upload failed" });
        setUploading(false);
        return;
      }
      const testRes = await fetch("http://localhost:5050/overhead-press", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: uploadData.filename, ejercicio: "tiron_pecho" }),
      });
      const testData = await testRes.json();
      setResult(testData);
    } catch (e) {
      setResult({ error: "Test failed" });
    }
    setUploading(false);
  };

  const bicepCurl = async () => {
    if (!videoBlob) return;
    setUploading(true);
    setResult(null);
    const formData = new FormData();
    const file = new File([videoBlob], "bicep-curl.mp4", { type: "video/mp4" });
    formData.append("video", file, file.name);
    try {
      // Upload the file first (if not already uploaded)
      const uploadRes = await fetch("http://localhost:5050/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setResult({ error: uploadData.error || "Upload failed" });
        setUploading(false);
        return;
      }
      const testRes = await fetch("http://localhost:5050/bicep-curl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: uploadData.filename, ejercicio: "bicep" }),
      });
      const testData = await testRes.json();
      setResult(testData);
    } catch (e) {
      setResult({ error: "Test failed" });
    }
    setUploading(false);
  };

  // Fetch selected exercise from Firestore for the logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        const docRef = doc(db, "selectedExercise", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSelectedExercise(data.exercise || null);
        } else {
          setSelectedExercise(null);
        }
      } else {
        setSelectedExercise(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      // Stop recording if still active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      // Stop all video tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Save progression to Firestore
  const saveProgression = async () => {
    const user = getAuth().currentUser;
    if (!user || !weight) return;
    // Map API exercise to Firestore exercise name
    let exerciseName = result?.ejercicio ?? selectedExercise;
    if (exerciseName === "bicep") exerciseName = "bicep-curl";
    if (exerciseName === "tiron_pecho") exerciseName = "overhead-press";
    const reps = result?.repeticiones ?? null;
    const progressionData = {
      date: new Date().toLocaleDateString(),
      weight: parseFloat(weight),
      userId: user.uid,
      exercise: exerciseName,
      reps: reps,
    };
    try {
      let muscleGroup = "chest";
      if (exerciseName === "bicep-curl") muscleGroup = "arms";
      if (exerciseName === "overhead-press") muscleGroup = "shoulders";
      await import("firebase/firestore").then(async ({ collection, addDoc }) => {
        await addDoc(
          collection(
            db,
            "muscleGroups",
            muscleGroup,
            "exercises",
            exerciseName || "",
            "progressionHistory"
          ),
          progressionData
        );
      });
      setWeight("");
      alert("Progression saved!");
    } catch (e) {
      alert("Failed to save progression");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <video ref={videoRef} controls width={320} height={240} />
      {!recording && (
        <button onClick={startRecording} className="bg-blue-600 text-white px-4 py-2 rounded">
          Start Recording
        </button>
      )}
      {recording && (
        <button onClick={stopRecording} className="bg-red-600 text-white px-4 py-2 rounded">
          Stop Recording
        </button>
      )}
      {videoBlob && selectedExercise === "overhead-press" && (
        <button onClick={overheadPress} disabled={uploading} className="bg-yellow-600 text-white px-4 py-2 rounded ml-2">
          {uploading ? "Testing..." : "Test /overhead-press"}
        </button>
      )}
      {videoBlob && selectedExercise === "bicep-curl" && (
        <button onClick={bicepCurl} disabled={uploading} className="bg-yellow-600 text-white px-4 py-2 rounded ml-2">
          {uploading ? "Testing..." : "Test /bicep-curl"}
        </button>
      )}
      {result && (
        <pre className="bg-gray-100 p-2 rounded w-full max-w-md text-left">{JSON.stringify(result, null, 2)}</pre>
      )}
      {videoBlob && selectedExercise && (
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <input
            type="number"
            min="0"
            step="0.1"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="Enter weight (kg)"
            className="border rounded px-2 py-1 w-full"
          />
          <button
            onClick={saveProgression}
            disabled={!weight}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Save Progression
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;