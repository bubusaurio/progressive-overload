import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

interface ProgressEntry {
  date: string;
  weight: number;
  reps: number;
  sets: number;
  notes?: string;
  userId: string;
}

const chartConfigs = [
  {
    label: "Bench Press Progression",
    muscleGroup: "chest",
    exercise: "bench-press",
  },
  {
    label: "Bicep Curl Progression",
    muscleGroup: "arms",
    exercise: "bicep-curl",
  },
  {
    label: "Overhead Press Progression",
    muscleGroup: "shoulders",
    exercise: "overhead-press",
  },
];

const Statistics = () => {
  const [progressData, setProgressData] = useState<Record<string, ProgressEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    const fetchAll = async (userId: string) => {
      const results: Record<string, ProgressEntry[]> = {};
      for (const config of chartConfigs) {
        const progressionRef = collection(
          db,
          "muscleGroups",
          config.muscleGroup,
          "exercises",
          config.exercise,
          "progressionHistory"
        );
        const q = query(progressionRef, where("userId", "==", userId));
        const snapshot = await getDocs(q);
        const data: ProgressEntry[] = snapshot.docs.map((doc) => doc.data() as ProgressEntry);
        data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        results[config.exercise] = data;
      }
      setProgressData(results);
      setLoading(false);
    };

    unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        fetchAll(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading statistics...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-12">
      {chartConfigs.map((config) => (
        <div key={config.exercise}>
          <h1 className="text-2xl font-bold mb-4">{config.label}</h1>
          {(progressData[config.exercise]?.length ?? 0) === 0 ? (
            <p>No data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData[config.exercise]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: "Weight (lbs)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Weight" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      ))}
    </div>
  );
};

export default Statistics;