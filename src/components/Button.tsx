import styled from "styled-components";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const StyledButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 25px;
  margin: 10px 0;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;

  &:hover {
    background: #0056b3;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export default function Button({ children, onClick }: ButtonProps) {
  return <StyledButton onClick={onClick}>{children}</StyledButton>;
}