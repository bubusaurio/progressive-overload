// src/components/WorkoutCard.tsx
import styled from "styled-components";

const Card = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  font-size: 20px;
  color: #333;
`;

const Progress = styled.p`
  font-size: 16px;
  color: #666;
`;

interface WorkoutCardProps {
  title: string;
  progress: string;
}

const WorkoutCard = ({ title, progress }: WorkoutCardProps) => (
  <Card>
    <Title>{title}</Title>
    <Progress>{progress}</Progress>
  </Card>
);

export default WorkoutCard;