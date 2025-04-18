import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Workouts from "./pages/Workouts";
import Login from "./pages/Login"
import Signup from "./pages/Signup";
import Excersices from "./pages/Exercices";
import Navbar from "./components/Navbar";

export default function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/signup" element={<Signup />}/>
        <Route path="/exercises" element={<Excersices />}/>
      </Routes>
    </Router>
  );
}