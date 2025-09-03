import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// Import your company logo (place inside src/assets/)
import logo from "../assets/iotradigital_logo.png";

export default function Signup() {
  const { signup, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  // ✅ Email format validation
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Checks before submitting
    if (!validateEmail(email)) {
      return setMsg("Please enter a valid email address.");
    }
    if (password.length < 6) {
      return setMsg("Password must be at least 6 characters.");
    }
    if (password !== confirm) {
      return setMsg("Passwords do not match.");
    }

    try {
      await signup({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        {/* Logo + Title Section */}
        <div style={header}>
          <img src={logo} alt="Company Logo" style={logoStyle} />
          <h1 style={title}>ePTW</h1>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} style={formStyle}>
          <h2>Create Account</h2>
          {msg && <p style={{ color: "crimson" }}>{msg}</p>}
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            placeholder="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button disabled={loading}>
            {loading ? "Creating..." : "Sign up"}
          </button>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

/* Styles */
const wrap = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f7f9fc",
};

const card = {
  width: 340,
  padding: 24,
  border: "1px solid #eee",
  borderRadius: 12,
  backgroundColor: "white",
  boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
};

const header = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: 20,
};

const logoStyle = {
  width: 80,
  height: 80,
  objectFit: "contain",
  marginBottom: 8,
};

const title = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#333",
};

const formStyle = {
  display: "grid",
  gap: 12,
};
