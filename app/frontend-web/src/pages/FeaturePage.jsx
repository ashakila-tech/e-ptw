import { useParams, Link } from "react-router-dom";
import { FaHome, FaTachometerAlt } from "react-icons/fa";

// Map slugs to nice titles (shown on the page)
const TITLES = {
  "digital-permit-creation": "Digital Permit Creation",
  "automated-workflow": "Automated Workflow",
  "real-time-tracking": "Real-Time Tracking",
  "electronic-signatures": "Electronic Signatures",
  "document-management": "Document Management",
  "reporting-analytics": "Reporting & Analytics",
  "user-roles-permissions": "User Roles & Permissions",
  "key-request": "Key Request",
  "panic-alarm": "Panic Alarm",
};

export default function FeaturePage() {
  const { slug } = useParams();
  const title = TITLES[slug] || "Feature";

  return (
    <div style={{ padding: 24 }}>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h1 style={{ marginTop: 12 }}>{title}</h1>
      <p style={{ maxWidth: 720 }}>
        This is a placeholder page for <b>{title}</b>. You can build the
        full UI and functionality for this feature here (forms, tables, etc.).
      </p>
    </div>
  );
}
