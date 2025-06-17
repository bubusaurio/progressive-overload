import React from "react";
import VideoRecorder from "../components/VideoRecorder";

const VideoPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Record Your Exercise</h1>
      <VideoRecorder />
    </div>
  );
};

export default VideoPage;
