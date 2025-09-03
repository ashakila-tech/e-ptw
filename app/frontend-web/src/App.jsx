import { Routes, Route, Link, Navigate } from "react-router-dom";
import { FaHome, FaTachometerAlt } from "react-icons/fa"; // 👈 import icons
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import FeaturePage from "./pages/FeaturePage";
import PermitHistory from "./pages/PermitHistory";
import UserRoles from "./pages/UserRoles"; 

function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav style={{display:"flex", gap:12, padding:12, borderBottom:"1px solid #eee"}}>
      <Link to="/" style={navIcon}>
        <FaHome size={22} title="Home" />
      </Link>
      {/*<Link to="/dashboard" style={navIcon}>
        <FaTachometerAlt size={22} title="Dashboard" />
      </Link>*/}
      <span style={{flex:1}} />
      {user ? (
        <>
          {/*<span>{user.email}</span>*/}
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign up</Link>
        </>
      )}
    </nav>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/feature/permit-history" element={<PermitHistory />} /> 
          <Route path="/feature/user-roles" element={<UserRoles />} />
          <Route path="/feature/:slug" element={<FeaturePage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

/* ---------- Styles ---------- */
const navIcon = {
  marginRight: "16px",
  color: "#1565c0",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.2s ease, color 0.2s ease",
};
