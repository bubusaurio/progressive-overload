import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const StyledButton = styled.button`
  color: white;
  background: #6366f1;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  margin: 0 4px;
  font: inherit;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #4338ca;
  }
`;

const StyledLink = styled(Link)`
  color: white;
  background: #6366f1;
  border-radius: 6px;
  padding: 8px 18px;
  margin: 0 4px;
  text-decoration: none;
  font: inherit;
  transition: background 0.2s;
  &:hover {
    background: #4338ca;
  }
`;

const Nav = styled.nav`
  background: #242424;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 15px;

  a {
    color: white;
    text-decoration: none;
  }

  button {
    color: white;
    background: transparent;
    border: none;
    cursor: pointer;
    font: inherit;
    padding: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

export default function Navbar() {
  const navigate = useNavigate();
  const user = getAuth().currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out successfully");
      navigate("/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Logout error:", error.message);
      } else {
        console.error("An unknown error occurred during logout");
      }
    }
  };

  const handleProtectedNav = (path: string) => {
    if (getAuth().currentUser) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <Nav>
      <div className="flex items-center space-x-2">
        <Dumbbell size={28} className="text-white" />
        <Link to="/" className="font-bold text-xl">ProgressPro</Link>
      </div>
      <NavLinks>
        <StyledButton onClick={() => handleProtectedNav("/exercises")}>Exercises</StyledButton>
        <StyledButton onClick={() => handleProtectedNav("/statistics")}>Statistics</StyledButton>
        <StyledButton onClick={() => handleProtectedNav("/video")}>Video Recorder</StyledButton>
        {user ? (
          <StyledButton
            onClick={handleLogout}
            style={{ background: "#dc2626" }}
          >
            Log out
          </StyledButton>
        ) : (
          <StyledLink
            to="/login"
          >
            Login
          </StyledLink>
        )}
      </NavLinks>
    </Nav>
  );
}