import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, ExternalLink, Loader2 } from "lucide-react";
import "./AdminDashboard.css"; // Reuse your table styles

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "enrollments"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map((docSnap) => ({ 
          id: docSnap.id, 
          ...docSnap.data() 
        }));

        data.sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });

        setEnrollments(data);
      } catch (err) {
        console.error("Error processing enrollments:", err);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Firestore Permission Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "enrollments", id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating enrollment:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="flex-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)} className="btn-base btn-navy" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ margin: 0 }}>Student Enrollment Requests</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Loader2 className="animate-spin" size={40} />
          <p>Loading enrollments...</p>
        </div>
      ) : enrollments.length === 0 ? (
        <p>No enrollment requests found.</p>
      ) : (
        <div className="user-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="th-style">Email</th>
                <th className="th-style">Batch</th>
                <th className="th-style">Class</th>
                <th className="th-style">Status</th>
                <th className="th-style">Payment Slip</th>
                <th className="th-style">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enroll) => (
                <tr key={enroll.id}>
                  <td className="td-style">{enroll.email || "Unknown"}</td>
                  <td className="td-style">{enroll.batch || "Unknown"}</td>
                  <td className="td-style">{enroll.className} ({enroll.month})</td>
                  <td className="td-style">
                    <span className={`status-badge ${enroll.status}`}>
                      {(enroll.status || "pending").toUpperCase()}
                    </span>
                  </td>
                  <td className="td-style">
                    <a href={enroll.slipUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0A3D62', fontWeight: 'bold' }}>
                      View Slip <ExternalLink size={14} />
                    </a>
                  </td>
                  <td className="td-style">
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => handleUpdateStatus(enroll.id, "approved")} 
                        className="btn-base btn-orange btn-sm" 
                        disabled={enroll.status === "approved"}
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(enroll.id, "denied")} 
                        className="btn-base btn-danger btn-sm" 
                        disabled={enroll.status === "denied"}
                      >
                        <XCircle size={14} /> Deny
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}