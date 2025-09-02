import { useState } from "react";

// Mock roles data
const mockRoles = [
  { id: 1, name: "Admin", permissions: ["Create Permit", "Approve Permit", "Manage Users"] },
  { id: 2, name: "Supervisor", permissions: ["Review Permit", "Track Status"] },
  { id: 3, name: "Contractor", permissions: ["Create Permit"] },
];

const allPermissions = [
  "Create Permit",
  "Review Permit",
  "Approve Permit",
  "Track Status",
  "Manage Users",
];

export default function RolesPermissions() {
  const [roles, setRoles] = useState(mockRoles);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [tmpPermissions, setTmpPermissions] = useState([]);

  const startEdit = (role) => {
    setEditingRoleId(role.id);
    setTmpPermissions([...role.permissions]);
  };

  const togglePerm = (perm) => {
    setTmpPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const saveEdit = () => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === editingRoleId ? { ...r, permissions: tmpPermissions } : r
      )
    );
    setEditingRoleId(null);
  };

  const cancelEdit = () => {
    setEditingRoleId(null);
    setTmpPermissions([]);
  };

  return (
    <div style={wrap}>
      {/* Banner */}
      <div style={banner}>
        <h1 style={bannerTitle}>User Roles and Permissions</h1>
      </div>

      {/* Table */}
      <div style={content}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Role</th>
              <th style={th}>Permissions</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, idx) => (
              <tr key={role.id} style={idx % 2 === 0 ? rowEven : rowOdd}>
                <td style={td}>{role.name}</td>
                <td style={td}>
                  {role.permissions.map((p, i) => (
                    <span key={i} style={permissionBadge}>
                      {p}
                    </span>
                  ))}
                </td>
                <td style={td}>
                  <button style={btnPrimary} onClick={() => startEdit(role)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Edit Panel */}
        {editingRoleId && (
          <div style={editor}>
            <h2 style={editorTitle}>Edit Permissions</h2>
            {allPermissions.map((p) => (
              <label key={p} style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={tmpPermissions.includes(p)}
                  onChange={() => togglePerm(p)}
                />{" "}
                {p}
              </label>
            ))}
            <div style={editorButtons}>
              <button style={btnPrimary} onClick={saveEdit}>
                Save
              </button>
              <button style={btnSecondary} onClick={cancelEdit}>
                Cancel
              </button>
            </div>
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

const permissionBadge = {
  display: "inline-block",
  background: "#ffe0b2", // pastel orange
  color: "#5d4037",
  fontSize: "12px",
  fontWeight: "600",
  padding: "4px 8px",
  borderRadius: "6px",
  marginRight: "6px",
  marginBottom: "4px",
};

const btnPrimary = {
  padding: "6px 12px",
  marginRight: "8px",
  borderRadius: "6px",
  border: "none",
  background: "#42a5f5",
  color: "#fff",
  cursor: "pointer",
};

const btnSecondary = {
  ...btnPrimary,
  background: "#ef5350",
};

const editor = {
  marginTop: "24px",
  padding: "16px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  background: "#fff",
  maxWidth: "400px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};

const editorTitle = {
  fontSize: "18px",
  marginBottom: "12px",
};

const checkboxLabel = { display: "block", marginBottom: 8 };

const editorButtons = { marginTop: 12 };
