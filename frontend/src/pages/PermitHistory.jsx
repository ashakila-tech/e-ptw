// PermitHistory.jsx
import { useState } from "react";

// Mock permit history data
const mockHistory = [
  {
    id: 1,
    permitNumber: "P-001",
    applicant: "John Doe",
    date: "2025-08-01",
    status: "Approved",
    description: "Permit for electrical maintenance at Building A.",
  },
  {
    id: 2,
    permitNumber: "P-002",
    applicant: "Jane Smith",
    date: "2025-08-05",
    status: "Pending",
    description: "Permit request for plumbing work in Block C.",
  },
  {
    id: 3,
    permitNumber: "P-003",
    applicant: "Michael Lee",
    date: "2025-08-10",
    status: "Rejected",
    description: "Permit for road excavation near main gate.",
  },
];

export default function PermitHistory() {
  const [history] = useState(mockHistory);
  const [selectedPermit, setSelectedPermit] = useState(null);

  return (
    <div style={wrap}>
      {/* Banner */}
      <div style={banner}>
        <h1 style={bannerTitle}>Permit History</h1>
      </div>

      {/* Content */}
      <div style={content}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Permit #</th>
              <th style={th}>Applicant</th>
              <th style={th}>Date</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((permit, idx) => (
              <tr key={permit.id} style={idx % 2 === 0 ? rowEven : rowOdd}>
                <td style={td}>{permit.permitNumber}</td>
                <td style={td}>{permit.applicant}</td>
                <td style={td}>{permit.date}</td>
                <td style={td}>
                  <span
                    style={{
                      ...statusBadge,
                      background:
                        permit.status === "Approved"
                          ? "#c8e6c9"
                          : permit.status === "Pending"
                          ? "#fff9c4"
                          : "#ffcdd2",
                      color:
                        permit.status === "Approved"
                          ? "#2e7d32"
                          : permit.status === "Pending"
                          ? "#f57f17"
                          : "#c62828",
                    }}
                  >
                    {permit.status}
                  </span>
                </td>
                <td style={td}>
                  <button
                    style={moreBtn}
                    onClick={() =>
                      setSelectedPermit(
                        selectedPermit?.id === permit.id ? null : permit
                      )
                    }
                  >
                    {selectedPermit?.id === permit.id ? "Hide" : "More Details"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Details Panel */}
        {selectedPermit && (
          <div style={detailsCard}>
            <h2 style={{ marginBottom: "12px", color: "#1565c0" }}>
              Permit Details
            </h2>
            <p>
              <b>Permit #:</b> {selectedPermit.permitNumber}
            </p>
            <p>
              <b>Applicant:</b> {selectedPermit.applicant}
            </p>
            <p>
              <b>Date:</b> {selectedPermit.date}
            </p>
            <p>
              <b>Status:</b>{" "}
              <span
                style={{
                  ...statusBadge,
                  background:
                    selectedPermit.status === "Approved"
                      ? "#c8e6c9"
                      : selectedPermit.status === "Pending"
                      ? "#fff9c4"
                      : "#ffcdd2",
                  color:
                    selectedPermit.status === "Approved"
                      ? "#2e7d32"
                      : selectedPermit.status === "Pending"
                      ? "#f57f17"
                      : "#c62828",
                }}
              >
                {selectedPermit.status}
              </span>
            </p>
            <p>
              <b>Description:</b> {selectedPermit.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
const wrap = {
  fontFamily: "Arial, sans-serif",
  minHeight: "100vh",
  background: "#f9fafb",
};

const banner = {
  width: "100%",
  padding: "24px",
  background: "#e3f2fd", // pastel blue
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  marginBottom: "24px",
};

const bannerTitle = {
  margin: 0,
  fontSize: "24px",
  fontWeight: "700",
  color: "#1565c0",
};

const content = {
  padding: "24px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};

const th = {
  background: "#f1f8e9", // pastel green
  padding: "12px",
  textAlign: "left",
  fontWeight: "600",
  borderBottom: "1px solid #ddd",
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  verticalAlign: "top",
};

const rowEven = { background: "#ffffff" };
const rowOdd = { background: "#fafafa" };

const statusBadge = {
  display: "inline-block",
  fontSize: "12px",
  fontWeight: "600",
  padding: "4px 10px",
  borderRadius: "6px",
};

const moreBtn = {
  background: "#1565c0",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};

const detailsCard = {
  marginTop: "24px",
  padding: "20px",
  background: "#fff",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};
