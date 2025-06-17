import React, { useRef, useState, useEffect } from "react";

const API_URL = "http://localhost:5050/ejercicio"; // Adjust if your Flask API runs elsewhere

const VideoRecorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Start camera and recording
  const startRecording = async () => {
    setResult(null);
    setVideoBlob(null);
    // Use ideal facingMode for best mobile compatibility
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "user" } }
    });
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

  // Test video using /test_video endpoint
  const testVideo = async () => {
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
      // Call /test_video with the uploaded filename
      const testRes = await fetch("http://localhost:5050/test_video", {
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

  // Test bicep-curl.mp4 using /test_bicep_curl endpoint
  const testBicepCurl = async () => {
    setUploading(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:5050/test_bicep_curl", {
        method: "GET",
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: "Test bicep-curl.mp4 failed" });
    }
    setUploading(false);
  };

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
      {videoBlob && (
        <>
          <button onClick={uploadVideo} disabled={uploading} className="bg-green-600 text-white px-4 py-2 rounded">
            {uploading ? "Uploading..." : "Upload Video"}
          </button>
          <button onClick={testVideo} disabled={uploading} className="bg-yellow-600 text-white px-4 py-2 rounded ml-2">
            {uploading ? "Testing..." : "Test /test_video"}
          </button>
        </>
      )}
      <button onClick={testBicepCurl} disabled={uploading} className="bg-purple-600 text-white px-4 py-2 rounded mt-2">
        {uploading ? "Testing..." : "Test bicep-curl.mp4 (API)"}
      </button>
      {result && (
        <pre className="bg-gray-100 p-2 rounded w-full max-w-md text-left">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
};

export default VideoRecorder;