import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Import your firebase config

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

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out successfully");
      navigate("/login"); // Redirect to login page after logout
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Logout error:", error.message);
      } else {
        console.error("An unknown error occurred during logout");
      }
    }
  };

  return (
    <Nav>
      <div className="flex items-center space-x-2">
        <Dumbbell size={28} className="text-white" />
        <Link to="/" className="font-bold text-xl">ProgressPro</Link>
      </div>
      <NavLinks>
        <button
          onClick={handleLogout}
          className="text-sm text-white bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"
        >
          Log out
        </button>
      </NavLinks>
    </Nav>
  );
}