// src/ClassCard.js
import React, { useState, useEffect } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Lock, Clock, Eye, Upload, X } from "lucide-react";

export default function ClassCard({ className, month, locked, batch }) {
  const [showPopup, setShowPopup] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState(locked ? "locked" : "locked");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  // Track logged in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, [auth]);

  // Fetch class data from Firestore
  useEffect(() => {
    const fetchClassData = async () => {
      if (!batch || !className || !month) return;
      try {
        const batchRef = doc(db, "batches", batch);
        const batchSnap = await getDoc(batchRef);
        if (batchSnap.exists()) {
          const data = batchSnap.data();
          const classList = data.classes || [];
          const found = classList.find(
            (c) =>
              c.name?.toLowerCase() === className?.toLowerCase() &&
              c.month?.toLowerCase() === month?.toLowerCase()
          );
          if (found) {
            setDescription(found.description || "");
            setImageURL(found.imageURL || "");
            setStatus(found.locked ? "locked" : "locked");
          }
        }
      } catch (err) {
        console.error("Error fetching class info:", err);
      }
    };
    fetchClassData();
  }, [batch, className, month]);

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!currentUser) return;
      const q = query(
        collection(db, "enrollments"),
        where("studentId", "==", currentUser.uid),
        where("className", "==", className),
        where("month", "==", month)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setStatus(data.status); // pending, approved, denied
        if (data.whatsappNumber) setWhatsapp(data.whatsappNumber);
      } else {
        setStatus("locked"); // no enrollment yet
      }
    };
    checkEnrollment();
  }, [currentUser, className, month]);

  if (!currentUser)
    return (
      <p className="text-gray-600 text-center py-8">
        Please log in to see this class.
      </p>
    );

  const handleClick = () => {
    if (status === "locked" || status === "denied") setShowPopup(true);
    else if (status === "pending") alert("Payment slip is pending approval.");
    else if (status === "approved") {
      navigate(`/class/${batch}/${className}/${month}`);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a payment slip file!");
    if (!whatsapp) return alert("Please enter your WhatsApp number!");
    if (!currentUser || !currentUser.uid) return alert("User not logged in!");
    if (file.size > 5 * 1024 * 1024)
      return alert("File too large (<5MB).");

    setUploading(true);
    setProgress(0);

    try {
      const storage = getStorage();
      const fileRef = ref(
        storage,
        `payment-slips/${currentUser.uid}/${Date.now()}-${file.name}`
      );

      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(prog.toFixed(0));
        },
        (error) => {
          console.error("Upload error:", error);
          alert("Upload failed. Check console. Make sure Storage rules allow this user.");
          setUploading(false);
        },
        async () => {
          const enrollQuery = query(
            collection(db, "enrollments"),
            where("studentId", "==", currentUser.uid),
            where("className", "==", className),
            where("month", "==", month)
          );
          const snapshot = await getDocs(enrollQuery);

          if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await updateDoc(doc(db, "enrollments", docId), {
              slipPath: uploadTask.snapshot.ref.fullPath,
              whatsappNumber: whatsapp,
              status: "pending",
              updatedAt: serverTimestamp(),
            });
          } else {
            await addDoc(collection(db, "enrollments"), {
              studentId: currentUser.uid,
              email: currentUser.email,
              whatsappNumber: whatsapp,
              batch: batch || "unknown",
              className: className || "unknown",
              month: month || "unknown",
              status: "pending",
              slipPath: uploadTask.snapshot.ref.fullPath,
              timestamp: serverTimestamp(),
            });
          }

          setStatus("pending");
          alert("Payment slip uploaded! Pending approval.");
          setShowPopup(false);
          setFile(null);
          setProgress(0);
          setUploading(false);
        }
      );
    } catch (err) {
      console.error("Error uploading:", err);
      alert("Error: " + err.message);
      setUploading(false);
    }
  };

  const getButtonLabel = () => {
    if (status === "locked" || status === "denied") return "Pay Now";
    if (status === "pending") return "Pending";
    if (status === "approved") return "View";
  };

  const getButtonIcon = () => {
    if (status === "locked" || status === "denied") return <Lock className="w-5 h-5" />;
    if (status === "pending") return <Clock className="w-5 h-5" />;
    if (status === "approved") return <Eye className="w-5 h-5" />;
  };

  return (
    <>
      <div
        className={`border-2 rounded-2xl p-0 overflow-hidden w-full max-w-md flex flex-col transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-2 ${
          status === "approved"
            ? "bg-green-50 border-green-400"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Image Section (Top) */}
        {imageURL && (
          <div className="w-full h-56 flex-shrink-0">
            <img
              src={imageURL}
              alt={className}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Section (Bottom) */}
        <div className="p-6 text-left">
          <h2 className="text-2xl font-black mb-1 leading-tight" style={{ color: "#0A3D62" }}>
            {className}
          </h2>
          <h3 className="text-lg font-bold text-orange-500 mb-3 uppercase tracking-wide">
            {month}
          </h3>
          
          {description && (
            <p className="text-sm text-gray-700 mb-5 leading-relaxed line-clamp-3">
              {description}
            </p>
          )}

          <button
            onClick={handleClick}
            disabled={status === "pending" || !currentUser}
            className={`w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black text-md uppercase tracking-wide transition-all duration-300 shadow-md hover:shadow-lg ${
              status === "locked" || status === "denied"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : status === "pending"
                ? "bg-yellow-500 cursor-not-allowed opacity-80 text-gray-800"
                : "text-white"
            }`}
            style={status === "approved" ? { backgroundColor: "#FF8C00" } : {}}
          >
            {getButtonIcon()}
            <span>{getButtonLabel()}</span>
          </button>
        </div>
      </div>

      {/* Upload Popup remains exactly the same as before */}
      {showPopup && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowPopup(false);
              setFile(null);
              setProgress(0);
            }}
          />

          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setFile(null);
                  setProgress(0);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-2xl font-black mb-2" style={{ color: "#0A3D62" }}>
                  Upload Payment Slip
                </h3>
                <p className="text-gray-600">
                  <span className="font-semibold">{className}</span> - {month}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Slip (Image/PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                />
                {file && <p className="text-sm text-green-600 mt-2">✓ {file.name}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., +94771234567"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {uploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Uploading...</span>
                    <span className="text-sm font-bold text-orange-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !currentUser}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 shadow-md ${
                    uploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                  }`}
                >
                  {uploading ? "Uploading..." : "Submit"}
                </button>
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setFile(null);
                    setProgress(0);
                  }}
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}