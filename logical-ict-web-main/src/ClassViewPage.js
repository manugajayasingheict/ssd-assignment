import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc, query, where, collection, getDocs } from "firebase/firestore"; // Added query utils
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Video, Calendar, Lock, ArrowLeft, Play, ExternalLink, ShieldAlert } from "lucide-react";
import "./ClassViewPage.css";
import image2 from './images/image2.jpg';
import image4 from './images/image4.jpg';

export default function ClassViewPage() {
  const { batch, className, month } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false); // New: Authorization state
  const [checkingAccess, setCheckingAccess] = useState(true); // New: Loading state for security check
  const navigate = useNavigate();

  const auth = getAuth();

  // Background scrolling images
  const backgroundImages = [image2, image4, image2, image4];

  // Track logged-in student AND check enrollment status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // SECURITY CHECK: Verify if this specific user is approved for this specific class/batch
          const q = query(
            collection(db, "enrollments"),
            where("studentId", "==", user.uid),
            where("batch", "==", batch),
            where("className", "==", className),
            where("month", "==", month),
            where("status", "==", "approved")
          );

          const enrollSnap = await getDocs(q);
          
          if (!enrollSnap.empty) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } catch (err) {
          console.error("Security check error:", err);
          setIsAuthorized(false);
        }
      }
      setCheckingAccess(false);
    });
    return unsubscribe;
  }, [auth, batch, className, month]);

  // Fetch class details
  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const batchRef = doc(db, "batches", batch);
        const batchSnap = await getDoc(batchRef);
        if (batchSnap.exists()) {
          const data = batchSnap.data();
          const found = (data.classes || []).find(
            (c) =>
              c.name?.toLowerCase() === className.toLowerCase() &&
              c.month?.toLowerCase() === month.toLowerCase()
          );
          setClassInfo(found || {});
        }
      } catch (err) {
        console.error("Error fetching class details:", err);
      }
    };
    fetchClassDetails();
  }, [batch, className, month]);

  // 1. Handle Not Logged In
  if (!currentUser && !checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h2 className="text-2xl font-black mb-4" style={{ color: '#0A3D62' }}>
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">Please log in to access this class.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: '#FF8C00' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // 2. Handle Not Authorized (Enrolled in different batch or not approved)
  if (!isAuthorized && !checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md border-t-8 border-red-500">
          <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-black mb-4" style={{ color: '#0A3D62' }}>
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You are not enrolled in the <strong>{batch}</strong> batch for this class. 
            If you have paid, please wait for admin approval.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: '#0A3D62' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 3. Handle Loading State
  if (checkingAccess || !classInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Animated Background Images */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="flex animate-scroll-left" style={{ height: '200vh' }}>
          {[...backgroundImages, ...backgroundImages, ...backgroundImages].map((img, index) => (
            <div key={index} className="flex-shrink-0 w-80 relative" style={{ height: '200vh' }}>
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover opacity-20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 shadow-lg" style={{ backgroundColor: '#0A3D62' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors mb-4 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Classes
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-orange-500 p-4 rounded-xl shadow-lg">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                {className}
              </h1>
              <div className="flex items-center gap-4 text-orange-400">
                <span className="flex items-center gap-2 font-bold text-lg">
                  <Calendar className="w-5 h-5" />
                  {month}
                </span>
                <span className="px-3 py-1 bg-orange-500 bg-opacity-20 rounded-full text-sm font-bold">
                  {batch}
                </span>
              </div>
            </div>
          </div>
          
          {classInfo.description && (
            <p className="text-white text-opacity-90 text-lg leading-relaxed max-w-4xl">
              {classInfo.description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Zoom Sessions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-l-8 border-orange-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 p-3 rounded-lg">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-3xl font-black" style={{ color: '#0A3D62' }}>
              Live Zoom Sessions
            </h2>
          </div>
          
          {classInfo.zoomLinks && classInfo.zoomLinks.length > 0 ? (
            <div className="space-y-4">
              {classInfo.zoomLinks.map((linkObj, idx) => {
                const meetingId = linkObj.meetingId || linkObj;
                const passcode = linkObj.passcode || "";
                const zoomWebUrl = `https://zoom.us/j/${meetingId}?prefer=1${
                  passcode ? `&pwd=${passcode}` : ""
                }`;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-orange-500 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <ExternalLink className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-lg" style={{ color: '#0A3D62' }}>
                          Session {idx + 1}
                        </p>
                        {passcode && (
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Passcode:</span>{" "}
                            <span className="font-mono bg-gray-200 px-2 py-1 rounded">{passcode}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={zoomWebUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      Join Now
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg">No live Zoom sessions scheduled yet.</p>
            </div>
          )}
        </div>

        {/* Recordings Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-t-8 border-orange-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Play className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-3xl font-black" style={{ color: '#0A3D62' }}>
              Class Recordings
            </h2>
          </div>
          
          {classInfo.recordings && classInfo.recordings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {classInfo.recordings.map((rec, idx) => (
                <div
                  key={idx}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-orange-500 transition-all shadow-md hover:shadow-xl"
                >
                  <div className="p-5" style={{ backgroundColor: '#FF8C00' }}>
                    <h3 className="font-black text-xl text-white flex items-center gap-2 drop-shadow-md">
                      <Play className="w-6 h-6" />
                      <span>{rec.title}</span>
                    </h3>
                  </div>
                  <div className="relative pb-[56.25%] bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${rec.videoId}?rel=0&modestbranding=1&controls=1&showinfo=0&disablekb=1`}
                      title={rec.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full"
                    ></iframe>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg">No recordings uploaded yet.</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for class recordings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}