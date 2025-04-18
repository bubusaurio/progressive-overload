import React, { useState } from "react";
import styled from "styled-components";
import WorkoutCard from "../components/WorkoutCard";

// Styled-components for layout
const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const SectionTitle = styled.h2<{ isActive: boolean }>`
  font-size: 24px;
  color: ${({ isActive }) => (isActive ? "#fff" : "#333")};
  background-color: ${({ isActive }) => (isActive ? "#007bff" : "#f1f1f1")};
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #0056b3;
    color: white;
  }
`;

const SectionContent = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 10px;
  max-height: ${({ isOpen }) => (isOpen ? "1000px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease-out;
`;

const AddButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: #218838;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 1000;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const ModalTitle = styled.h3`
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const ModalButton = styled.button<{ primary?: boolean }>`
  width: 48%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({ primary }) => (primary ? "#007bff" : "#ccc")};
  color: white;
  font-size: 16px;

  &:hover {
    background-color: ${({ primary }) => (primary ? "#0056b3" : "#888")};
  }
`;

type SectionKey = "chest" | "back" | "biceps" | "triceps" | "legs";

interface Workout {
  title: string;
  lastWeight: string;
  newWeight: string;
}

const Workouts = () => {
  const [collapsedSections, setCollapsedSections] = useState<Record<SectionKey, boolean>>({
    chest: false,
    back: false,
    biceps: false,
    triceps: false,
    legs: false,
  });

  const [workouts, setWorkouts] = useState<Record<SectionKey, Workout[]>>({
    chest: [
      { title: "Bench Press", lastWeight: "80kg", newWeight: "85kg" },
      { title: "Incline Dumbbell Press", lastWeight: "25kg", newWeight: "27.5kg" },
    ],
    back: [
      { title: "Deadlift", lastWeight: "120kg", newWeight: "125kg" },
      { title: "Pull-ups", lastWeight: "Bodyweight", newWeight: "5kg added" },
    ],
    biceps: [
      { title: "Barbell Curl", lastWeight: "40kg", newWeight: "45kg" },
      { title: "Dumbbell Curl", lastWeight: "12.5kg", newWeight: "15kg" },
    ],
    triceps: [
      { title: "Triceps Dips", lastWeight: "Bodyweight", newWeight: "10kg added" },
      { title: "Triceps Pushdown", lastWeight: "30kg", newWeight: "35kg" },
    ],
    legs: [
      { title: "Squats", lastWeight: "100kg", newWeight: "110kg" },
      { title: "Leg Press", lastWeight: "150kg", newWeight: "160kg" },
    ],
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [newWorkout, setNewWorkout] = useState<Workout>({ title: "", lastWeight: "", newWeight: "" });
  const [selectedSection, setSelectedSection] = useState<SectionKey | null>(null);

  const toggleSection = (section: SectionKey) => {
    setCollapsedSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  const handleAddWorkout = () => {
    if (selectedSection && newWorkout.title && newWorkout.lastWeight && newWorkout.newWeight) {
      setWorkouts((prevState) => ({
        ...prevState,
        [selectedSection]: [...prevState[selectedSection], newWorkout],
      }));
      setNewWorkout({ title: "", lastWeight: "", newWeight: "" });
      setModalOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWorkout((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Container>
      {/* Render sections */}
      {Object.keys(workouts).map((key) => {
        const section = key as SectionKey;
        return (
          <Section key={section}>
            <SectionTitle
              isActive={collapsedSections[section]}
              onClick={() => toggleSection(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </SectionTitle>
            <SectionContent isOpen={collapsedSections[section]}>
              {workouts[section].map((workout, index) => (
                <WorkoutCard key={index} title={workout.title} progress={`${workout.lastWeight} → ${workout.newWeight}`} />
              ))}
              <AddButton onClick={() => { setSelectedSection(section); setModalOpen(true); }}>
                Add New Workout
              </AddButton>
            </SectionContent>
          </Section>
        );
      })}

      {/* Modal for adding a new workout */}
      {modalOpen && (
        <>
          <ModalOverlay onClick={() => setModalOpen(false)} />
          <ModalContainer>
            <ModalTitle>Add New Workout</ModalTitle>
            <ModalInput
              type="text"
              name="title"
              placeholder="Workout Title"
              value={newWorkout.title}
              onChange={handleInputChange}
            />
            <ModalInput
              type="text"
              name="lastWeight"
              placeholder="Last Weight"
              value={newWorkout.lastWeight}
              onChange={handleInputChange}
            />
            <ModalInput
              type="text"
              name="newWeight"
              placeholder="New Weight"
              value={newWorkout.newWeight}
              onChange={handleInputChange}
            />
            <ModalButtonContainer>
              <ModalButton primary onClick={handleAddWorkout}>
                Add
              </ModalButton>
              <ModalButton onClick={() => setModalOpen(false)}>Close</ModalButton>
            </ModalButtonContainer>
          </ModalContainer>
        </>
      )}
    </Container>
  );
};

export default Workouts;