import React, { useEffect, useState } from 'react';

import chest from '../img/chest.png';
import back from '../img/back.png';
import biceps from '../img/biceps.png';
import legs from '../img/leg.png';
import shoulder from '../img/shoulder.png';
import core from '../img/core.png';

import { 
  ChevronRight, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  BarChart3,
  Calendar,
  Dumbbell
} from 'lucide-react';
import { getFirestore, collection, getDocs, Timestamp, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../firebase";

// Types for our data structures
interface Exercise {
  id: string;
  name: string;
  description: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  progressionHistory: ProgressEntry[];
}

interface ProgressEntry {
  date: string;
  weight: number;
  reps: number;
  sets: number;
  notes?: string;
  userId: string;
}

interface MuscleGroup {
  id: string;
  name: string;
  exercises: Exercise[];
  imageUrl: string;
}

const fetchProgressionHistory = async (
  muscleGroupId: string,
  exerciseId: string,
  userId: string
): Promise<ProgressEntry[]> => {
  const progressionRef = collection(
    db,
    "muscleGroups",
    muscleGroupId,
    "exercises",
    exerciseId,
    "progressionHistory"
  );
  
  const q = query(progressionRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const history: ProgressEntry[] = snapshot.docs.map((doc) => doc.data() as ProgressEntry);
  return history;
};

const fetchMuscleGroupsWithProgressionHistory = async () => {
  const userId = getAuth().currentUser?.uid;
  
  if (!userId) {
    return []; 
  }
  const muscleGroups: MuscleGroup[] = [
    {
      id: 'chest',
      name: 'Chest',
      imageUrl: chest,
      exercises: [
        {
          id: 'bench-press',
          name: 'Bench Press',
          description: 'A compound exercise that targets the chest muscles, shoulders, and triceps.',
          primaryMuscles: ['Chest'],
          secondaryMuscles: ['Shoulders', 'Triceps'],
          instructions: [
            'Lie on a flat bench with your feet firmly on the ground',
            'Grip the barbell slightly wider than shoulder-width apart',
            'Lower the bar to your mid-chest',
            'Press the bar back up to the starting position',
          ],
          progressionHistory: []
        },
        {
          id: 'incline-press',
          name: 'Incline Dumbbell Press',
          description: 'Targets the upper chest muscles.',
          primaryMuscles: ['Upper Chest'],
          secondaryMuscles: ['Shoulders', 'Triceps'],
          instructions: [
            'Set an adjustable bench to a 30-45 degree incline',
            'Hold a dumbbell in each hand at shoulder level',
            'Press the dumbbells upward until your arms are extended',
            'Lower the dumbbells back to shoulder level',
          ],
          progressionHistory: []
        },
      ]
    },
    {
      id: 'back',
      name: 'Back',
      imageUrl: back,
      exercises: [
        {
          id: 'pull-up',
          name: 'Pull-up',
          description: 'A bodyweight exercise that targets the upper back and biceps.',
          primaryMuscles: ['Latissimus Dorsi'],
          secondaryMuscles: ['Biceps', 'Rhomboids'],
          instructions: [
            'Hang from a pull-up bar with hands slightly wider than shoulder-width',
            'Pull your body up until your chin is over the bar',
            'Lower yourself back down to the starting position',
          ],
          progressionHistory: []
        },
        {
          id: 'deadlift',
          name: 'Deadlift',
          description: 'A compound exercise that targets the entire posterior chain.',
          primaryMuscles: ['Lower Back', 'Hamstrings'],
          secondaryMuscles: ['Glutes', 'Traps', 'Forearms'],
          instructions: [
            'Stand with feet shoulder-width apart',
            'Bend at the hips and knees to grip the barbell',
            'Lift the bar by extending hips and knees',
            'Return the bar to the floor by hinging at the hips',
          ],
          progressionHistory: []
        },
      ]
    },
    {
      id: 'legs',
      name: 'Legs',
      imageUrl: legs,
      exercises: [
        {
          id: 'squat',
          name: 'Barbell Squat',
          description: 'A compound exercise that primarily targets the quadriceps, hamstrings, and glutes.',
          primaryMuscles: ['Quadriceps', 'Glutes'],
          secondaryMuscles: ['Hamstrings', 'Lower Back'],
          instructions: [
            'Place the barbell on your upper back',
            'Stand with feet shoulder-width apart',
            'Bend knees and hips to lower your body',
            'Return to standing position',
          ],
          progressionHistory: []
        }
      ]
    },
    {
      id: 'shoulders',
      name: 'Shoulders',
      imageUrl: shoulder,
      exercises: [
        {
          id: 'overhead-press',
          name: 'Overhead Press',
          description: 'A compound exercise that targets the shoulders and triceps.',
          primaryMuscles: ['Deltoids'],
          secondaryMuscles: ['Triceps', 'Upper Chest'],
          instructions: [
            'Stand with feet shoulder-width apart',
            'Hold a barbell at shoulder height',
            'Press the barbell overhead until arms are fully extended',
            'Lower the barbell back to shoulder height',
          ],
          progressionHistory: []
        }
      ]
    },
    {
      id: 'arms',
      name: 'Arms',
      imageUrl: biceps,
      exercises: [
        {
          id: 'bicep-curl',
          name: 'Bicep Curl',
          description: 'An isolation exercise that targets the biceps.',
          primaryMuscles: ['Biceps'],
          secondaryMuscles: ['Forearms'],
          instructions: [
            'Stand with feet shoulder-width apart',
            'Hold dumbbells with arms extended',
            'Curl the dumbbells toward your shoulders',
            'Lower the dumbbells back to the starting position',
          ],
          progressionHistory: []
        },
        {
          id: 'tricep-extension',
          name: 'Tricep Extension',
          description: 'An isolation exercise that targets the triceps.',
          primaryMuscles: ['Triceps'],
          secondaryMuscles: [],
          instructions: [
            'Stand or sit with a dumbbell held with both hands',
            'Raise the dumbbell overhead',
            'Lower the dumbbell behind your head by bending your elbows',
            'Extend your arms to raise the dumbbell back overhead',
          ],
          progressionHistory: []
        }
      ]
    },
    {
      id: 'core',
      name: 'Core',
      imageUrl: core,
      exercises: [
        {
          id: 'plank',
          name: 'Plank',
          description: 'A bodyweight exercise that targets the entire core.',
          primaryMuscles: ['Abs', 'Obliques'],
          secondaryMuscles: ['Lower Back', 'Shoulders'],
          instructions: [
            'Start in a push-up position',
            'Lower onto your forearms',
            'Keep your body in a straight line from head to heels',
            'Hold the position',
          ],
          progressionHistory: []
        }
      ]
    }
  ];
    for (const muscleGroup of muscleGroups) {
    for (const exercise of muscleGroup.exercises) {
      const history = await fetchProgressionHistory(muscleGroup.id, exercise.id, userId);
      exercise.progressionHistory = history;
    }
  }

  return muscleGroups;
};


// Exercise Modal Component
const ExerciseModal = ({ 
  exercise, 
  isOpen, 
  onClose,
}: { 
  exercise: Exercise | null, 
  isOpen: boolean, 
  onClose: () => void,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'progress'>('details');
  const [newEntry, setNewEntry] = useState<Partial<ProgressEntry>>({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    reps: 0,
    sets: 0,
    notes: ''
  });

  if (!isOpen || !exercise) return null;

  // Get stats for progressive overload
  const getProgressStats = () => {
    if (!exercise || exercise.progressionHistory.length < 2) return null;
    
    const sortedHistory = [...exercise.progressionHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const first = sortedHistory[0];
    const last = sortedHistory[sortedHistory.length - 1];
    
    const weightDiff = last.weight - first.weight;
    const weightPercent = ((last.weight - first.weight) / first.weight * 100).toFixed(1);
    
    return {
      startDate: new Date(first.date).toLocaleDateString(),
      endDate: new Date(last.date).toLocaleDateString(),
      weightDiff,
      weightPercent,
      totalSessions: sortedHistory.length
    };
  };

  const stats = getProgressStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl p-6 mx-4 bg-white rounded-lg shadow-xl max-h-screen overflow-auto">
        <button 
          onClick={onClose}
          className="absolute p-2 text-gray-500 top-4 right-4 hover:text-gray-700 focus:outline-none"
        >
          <X size={24} />
        </button>
        
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{exercise.name}</h2>
            <div className="flex space-x-2">
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none ${
                  activeTab === 'details' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none ${
                  activeTab === 'progress' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('progress')}
              >
                Progress
              </button>
            </div>
          </div>
          
          {activeTab === 'details' && (
            <div className="mt-6">
              <p className="text-gray-700">{exercise.description}</p>
              
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900">Target Muscles</h3>
                <div className="mt-2">
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-500">Primary</h4>
                    <p>{exercise.primaryMuscles.join(', ')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Secondary</h4>
                    <p>{exercise.secondaryMuscles.length > 0 ? exercise.secondaryMuscles.join(', ') : 'None'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900">Instructions</h3>
                <ol className="mt-2 ml-5 space-y-2 list-decimal">
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index} className="text-gray-700">{instruction}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
          
          {activeTab === 'progress' && (
            <div className="mt-6">
              {stats && (
                <div className="p-4 mb-6 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Progressive Overload Summary</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-blue-600">Period</p>
                      <p className="font-medium">{stats.startDate} - {stats.endDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Weight Increase</p>
                      <p className="font-medium">{stats.weightDiff > 0 ? '+' : ''}{stats.weightDiff} lbs ({stats.weightPercent}%)</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Total Sessions</p>
                      <p className="font-medium">{stats.totalSessions}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900">Progress History</h3>
                {exercise.progressionHistory.length > 0 ? (
                  <div className="mt-2 overflow-hidden border border-gray-200 rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Weight</th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sets</th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Reps</th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[...exercise.progressionHistory]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((entry, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{new Date(entry.date).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{entry.weight} lbs</td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{entry.sets}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{entry.reps}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{entry.notes || '-'}</td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-2 text-gray-500">No progress entries yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Muscle Groups View Component
const Exercises = () => {
  const [muscleGroupsData, setMuscleGroupsData] = useState<MuscleGroup[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;
  
    const init = async () => {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const data = await fetchMuscleGroupsWithProgressionHistory();
            setMuscleGroupsData(data);
          } catch (error) {
            console.error('Error fetching muscle groups:', error);
          } finally {
            setIsLoading(false);
          }
        } else {
          console.log('No user signed in');
          setIsLoading(false);
        }
      });
    };
  
    init();
  
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const toggleMuscleGroup = (muscleId: string) => {
    setSelectedMuscle(selectedMuscle === muscleId ? null : muscleId);
  };

  const openExerciseModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const closeExerciseModal = () => {
    setIsModalOpen(false);
    setSelectedExercise(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading exercises...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="pb-5 mb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Muscle Groups & Exercises</h1>
          <p className="mt-2 text-gray-600">View exercises by muscle group and track your progressive overload.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {muscleGroupsData.map((muscleGroup) => (
            <div key={muscleGroup.id} className="overflow-hidden bg-white rounded-lg shadow">
              <div className="relative">
                <img 
                  src={muscleGroup.imageUrl} 
                  alt={muscleGroup.name} 
                  className="object-cover w-full h-40"
                />
                <div className="absolute inset-0 bg-black opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-white">{muscleGroup.name}</h2>
                </div>
              </div>

              <div className="p-4">
                <button
                  onClick={() => toggleMuscleGroup(muscleGroup.id)}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
                >
                  <span>
                    {selectedMuscle === muscleGroup.id ? 'Hide Exercises' : 'Show Exercises'} 
                    <span className="ml-1 text-gray-500">({muscleGroup.exercises.length})</span>
                  </span>
                  {selectedMuscle === muscleGroup.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {selectedMuscle === muscleGroup.id && (
                  <div className="mt-3 space-y-2">
                    {muscleGroup.exercises.map((exercise) => (
                      <div key={exercise.id} className="p-3 transition-colors border border-gray-200 rounded-md hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">{exercise.name}</h3>
                          <button
                            onClick={() => openExerciseModal(exercise)}
                            className="flex items-center justify-center p-1 text-blue-600 rounded-full hover:bg-blue-100 focus:outline-none"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{exercise.description}</p>

                        <div className="flex items-center mt-2 space-x-3">
                          <div className="flex items-center text-xs text-gray-500">
                            <Dumbbell size={14} className="mr-1" />
                            {exercise.progressionHistory.length > 0 
                              ? `${exercise.progressionHistory[exercise.progressionHistory.length - 1].weight} lbs` 
                              : 'No data'}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar size={14} className="mr-1" />
                            {exercise.progressionHistory.length > 0 
                              ? new Date(exercise.progressionHistory[exercise.progressionHistory.length - 1].date).toLocaleDateString() 
                              : 'No data'}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <BarChart3 size={14} className="mr-1" />
                            {exercise.progressionHistory.length} logs
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ExerciseModal 
        exercise={selectedExercise} 
        isOpen={isModalOpen} 
        onClose={closeExerciseModal} 
      />
    </div>
  );
};

export default Exercises;