import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore"; // 👈 Added updateDoc
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Trash2, UserCheck, UserX, ExternalLink } from "lucide-react"; // 👈 New icons
import { showSuccess, showError } from "./utils/alerts";
import "./AdminUserList.css"; 

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubSnapshot;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubSnapshot = onSnapshot(
          collection(db, "users"),
          (snap) => {
            setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          },
          (error) => {
            console.error("Firestore Error:", error.message);
          }
        );
      } else {
        setUsers([]);
        if (unsubSnapshot) unsubSnapshot();
      }
    });

    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);     

  // 👈 New Verification Logic
  const handleToggleVerification = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isVerified: !currentStatus
      });
      showSuccess(`Student marked as ${!currentStatus ? 'Verified' : 'Unverified'}`);
    } catch (err) {
      showError("Failed to update status.");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Permanently delete ${userName}?`)) {
      try {
        await deleteDoc(doc(db, "users", userId));
        showSuccess("User deleted");
      } catch (err) {
        showError("Delete failed");
      }
    }
  };

  return (
    <div className="admin-user-container">
      <button onClick={() => navigate(-1)} className="btn-back">
        ← Back to Dashboard
      </button>

      <h1 className="user-list-title">All Registered Students</h1>

      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Status</th>
              <th>NIC & Proof</th> {/* 👈 Updated Column */}
              <th>Email</th>
              <th>Batch</th>
              <th>District</th>
              <th>WhatsApp</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: "600", color: "#0A3D62" }}>{u.fullName}</td>
                <td>
                  {u.isVerified || u.emailVerified ? (
                    <div className="status-badge verified">
                      <CheckCircle2 size={14} /> Verified
                    </div>
                  ) : (
                    <div className="status-badge unverified">
                      <XCircle size={14} /> Unverified
                    </div>
                  )}
                </td>
                {/* 👈 Direct NIC Checking */}
                <td>
                  <div className="nic-info-cell">
                    <span className="nic-text">{u.nic || "N/A"}</span>
                    <div className="nic-links">
                      {u.nicFrontUrl && (
                        <a href={u.nicFrontUrl} target="_blank" rel="noreferrer" title="Front Side">
                          Front <ExternalLink size={10} />
                        </a>
                      )}
                      {u.nicBackUrl && (
                        <a href={u.nicBackUrl} target="_blank" rel="noreferrer" title="Back Side">
                          Back <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td>{u.email}</td>
                <td><span className="batch-badge">{u.batch}</span></td>
                <td>{u.district}</td>
                <td>{u.whatsapp}</td>
                <td>
                  <div className="admin-actions-cell">
                    {/* 👈 Toggle Verification Button */}
                    <button 
                      onClick={() => handleToggleVerification(u.id, (u.isVerified || u.emailVerified))}
                      className={`btn-action ${u.isVerified ? 'btn-unverify' : 'btn-verify'}`}
                      title={u.isVerified ? "Mark as Unverified" : "Mark as Verified"}
                    >
                      {u.isVerified ? <UserX size={18} /> : <UserCheck size={18} />}
                    </button>

                    <button 
                      onClick={() => handleDeleteUser(u.id, u.fullName)}
                      className="btn-action btn-delete"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}