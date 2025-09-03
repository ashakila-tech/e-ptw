import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404 – Not Found</h2>
      <Link to="/dashboard">Go Home</Link>
    </div>
  );
}
