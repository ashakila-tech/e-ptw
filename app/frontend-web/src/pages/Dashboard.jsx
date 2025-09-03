import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaCogs,
  FaClock,
  FaSignature,
  FaFolderOpen,
  FaChartBar,
  FaUsersCog,
  FaKey,
  FaBell,
  FaHome,
  FaTachometerAlt,
} from "react-icons/fa";

// ➊ List of features for the grid with icons
const FEATURES = [
  { slug: "permit-history", label: "Permit History", icon: <FaClipboardList size={28} /> },
  { slug: "automated-workflow", label: "Automated Workflow", icon: <FaCogs size={28} /> },
  { slug: "real-time-tracking", label: "Real-Time Tracking", icon: <FaClock size={28} /> },
  { slug: "electronic-signatures", label: "Electronic Signatures", icon: <FaSignature size={28} /> },
  { slug: "document-management", label: "Document Management", icon: <FaFolderOpen size={28} /> },
  { slug: "reporting-analytics", label: "Reporting & Analytics", icon: <FaChartBar size={28} /> },
  { slug: "user-roles", label: "User Roles & Permissions", icon: <FaUsersCog size={28} /> },
  { slug: "key-request", label: "Key Request", icon: <FaKey size={28} /> },
  { slug: "panic-alarm", label: "Panic Alarm", icon: <FaBell size={28} /> },
];

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={wrap}>
      {/* Banner */}
      <div style={banner}>
        <h1 style={bannerTitle}>Dashboard</h1>
        <p style={welcome}>
          Welcome, <b>{user?.email}</b>
        </p>
        {/*<button onClick={logout} style={logoutBtn}>Log out</button>*/}
      </div>

      {/* Key Features */}
      <div style={grid}>
        {FEATURES.map((f) => (
          <Link key={f.slug} to={`/feature/${f.slug}`} style={card} className="feature-card">
            <div style={cardContent}>
              <div style={iconWrap}>{f.icon}</div>
              <span style={cardText}>{f.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------- Inline styles ---------- */
const wrap = {
  fontFamily: "Arial, sans-serif",
  minHeight: "100vh",
  background: "#f9fafb",
};

const banner = {
  width: "100%",
  padding: "24px",
  background: "#e3f2fd",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  marginBottom: "24px",
  borderRadius: "0 0 12px 12px",
};

const bannerTitle = {
  margin: 0,
  fontSize: "26px",
  fontWeight: "700",
  color: "#1565c0",
};

const welcome = {
  margin: "8px 0",
  fontSize: "16px",
  color: "#333",
};

const logoutBtn = {
  padding: "8px 16px",
  background: "#ef5350",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
  marginTop: "8px",
  transition: "background 0.2s ease",
};

const title = { 
  margin: "0 0 16px 24px", 
  fontSize: 20, 
  fontWeight: 600,
  color: "#374151"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
  padding: "0 24px 24px",
};

const card = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 130,
  borderRadius: 16,
  background: "#ffffff",
  border: "1px solid #e6e9ef",
  textDecoration: "none",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
};

const cardContent = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
};

const iconWrap = {
  color: "#1565c0",
};

const cardText = { 
  color: "#111827", 
  fontSize: 16, 
  fontWeight: 600, 
  textAlign: "center" 
};
