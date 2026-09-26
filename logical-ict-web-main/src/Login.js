import React, { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Mail, Lock, LogIn, UserPlus, Chrome, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

import image2 from './images/image2.jpg';
import image4 from './images/image4.jpg';

export default function Login({ onLogin, onNewUser, onAdminLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // 👈 New State
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 👈 New State

  // Admin email hardcoded
  const ADMIN_EMAIL = "manugajayasingheict@gmail.com";

  const backgroundImages = [image2, image4, image2, image4];

  const handleAuth = async () => {
    try {
      // Check admin first
      if (!isRegister && email === ADMIN_EMAIL) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (cred.user.email === ADMIN_EMAIL) {
          onAdminLogin();
          return;
        }
      }

      if (isRegister && password !== confirmPassword) {
        alert("Error: Passwords do not match!");
        return;
      }

      let user;

      if (isRegister) {
        // Student registration
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        user = cred.user;
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "student",
          createdAt: serverTimestamp(),
          isProfileComplete: false
        });
        onNewUser();
      } else {
        // Student login
        const cred = await signInWithEmailAndPassword(auth, email, password);
        user = cred.user;

        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (!docSnap.exists() || !docSnap.data().isProfileComplete) {
          onNewUser();
        } else {
          onLogin();
        }
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("openid");
      provider.addScope("profile");
      provider.addScope("email");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const isGoogleUser = user.providerData.some(
        ({ providerId }) => providerId === "google.com"
      );
      if (!isGoogleUser || !user.emailVerified) {
        throw new Error("Google account verification failed. Please use a verified Google account.");
      }

      if (user.email === ADMIN_EMAIL) {
        onAdminLogin();
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          fullName: user.displayName || "",
          role: "student",
          authProvider: "google.com",
          providerEmail: user.email,
          providerEmailVerified: true,
          createdAt: serverTimestamp(),
          isProfileComplete: false
        });
        onNewUser();
      } else if (!docSnap.data().isProfileComplete) {
        onNewUser();
      } else {
        onLogin();
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Scrolling Background Images */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="flex animate-scroll-left">
          {[...backgroundImages, ...backgroundImages, ...backgroundImages].map((img, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-80 h-full relative"
            >
              <img
                src={img}
                alt=""
                className="w-full h-screen object-cover opacity-30"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>
      
      <div className="w-full max-w-md relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center" style={{ backgroundColor: '#0A3D62' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mb-4 shadow-lg">
              {isRegister ? (
                <UserPlus className="w-10 h-10 text-white" />
              ) : (
                <LogIn className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-3xl font-black text-white mb-2">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-white text-opacity-80 text-sm">
              {isRegister 
                ? "Join our ICT learning platform" 
                : "Sign in to continue learning"
              }
            </p>
          </div>

          <div className="p-8">
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  placeholder="Type your YouTube email only"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-gray-800"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="Confirm your password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-800 ${
                      confirmPassword === "" 
                        ? "border-gray-300" 
                        : confirmPassword === password 
                        ? "border-green-500" 
                        : "border-red-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword !== "" && (
                  <div className="flex items-center mt-2 gap-1">
                    {confirmPassword === password ? (
                      <><CheckCircle2 className="w-4 h-4 text-green-500" /> <span className="text-xs text-green-600 font-bold">Passwords Match</span></>
                    ) : (
                      <><XCircle className="w-4 h-4 text-red-500" /> <span className="text-xs text-red-600 font-bold">Passwords do not match</span></>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleAuth}
              className="w-full py-4 px-6 rounded-xl font-black text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 mb-4"
              style={{ backgroundColor: '#FF8C00' }}
            >
              {isRegister ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-semibold">OR</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-4 px-6 bg-white border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
            >
              <Chrome className="w-5 h-5 text-red-500" />
              Continue with Google
            </button>

            <p className="text-center mt-6 text-gray-600">
              {isRegister ? "Already have an account?" : "New here?"}{" "}
              <span
                className="font-bold cursor-pointer hover:underline transition-all"
                style={{ color: '#FF8C00' }}
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Sign In" : "Create Account"}
              </span>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-gray-500 text-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
          display: flex;
        }
      `}</style>
    </div>
  );
}