import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";
import { User, School, Calendar, MapPin, Phone, Home, CreditCard, CheckCircle, Mail } from "lucide-react";
import { showSuccess, showError } from "./utils/alerts";


export default function RegisterForm({ onComplete }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(""); 
  const [school, setSchool] = useState("");
  const [batch, setBatch] = useState("2026 AL");
  const [district, setDistrict] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [nic, setNic] = useState("");
  const [loading, setLoading] = useState(false);

  const districts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", 
    "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", 
    "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", 
    "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
  ];

  const isOLBatch = batch.startsWith("2025 OL") || batch.startsWith("2026 OL") || batch.startsWith("2027 OL");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFullName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, []);

  const validate = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!school.trim()) return "School is required.";
    if (!district.trim()) return "Please select your district.";
    if (!whatsapp.trim()) return "WhatsApp number is required.";
    if (!address.trim()) return "Delivery address is required.";
    if (!nic.trim()) return isOLBatch ? "Parent NIC is required." : "Student NIC is required.";

    const whatsappPattern = /^(\+94\d{9}|\d{9})$/;
    if (!whatsappPattern.test(whatsapp.trim()))
      return "WhatsApp number must be 9 digits, optionally starting with +94.";

    if (isOLBatch) {
      if (!/^\d{9}[Vv]$/.test(nic.trim()))
        return "Parent NIC must be 9 digits followed by V or v.";
    } else {
      if (!/^\d{12}$/.test(nic.trim()))
        return "Student NIC must be exactly 12 digits.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);

    const user = auth.currentUser;
    if (!user) return alert("Please login first.");

    // Send verification email but DO NOT block the Save & Continue process
    if (!user.emailVerified) {
      sendEmailVerification(user).catch(() => console.log("Verification email throttle"));
    }

    setLoading(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(
        docRef,
        {
          fullName,
          email,
          school,
          batch,
          district,
          whatsapp,
          address,
          nic,
          isVerified: user.emailVerified,
          role: "student",
          isProfileComplete: true,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      showSuccess("Registration complete!");
      onComplete();
    } catch (err) {
      console.error(err);
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center" style={{ backgroundColor: '#0A3D62' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mb-4 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Complete Student Registration</h2>
            <p className="text-white text-opacity-80 text-sm">Fill in your details to start your ICT journey</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="e.g., John Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-gray-800"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address (Gmail)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl text-gray-500 cursor-not-allowed font-semibold"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">School</label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="e.g., ABC College"
                    value={school}
                    onChange={e => setSchool(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Batch</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <select
                    value={batch}
                    onChange={e => setBatch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none appearance-none bg-white cursor-pointer"
                  >
                    <option>2026 AL</option>
                    <option>2027 AL</option>
                    <option>2028 AL</option>
                    <option>2026 OL</option>
                    <option>2027 OL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="+94771234567"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-gray-800"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address</label>
                <div className="relative">
                  <Home className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    placeholder="e.g., 123 Main Street, Colombo"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none min-h-24 resize-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">{isOLBatch ? "Parent NIC" : "Student NIC"}</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder={isOLBatch ? "e.g., 123456789V" : "12 digits, e.g., 2000123456"}
                    value={nic}
                    onChange={e => setNic(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-gray-800"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-8 py-4 px-6 rounded-xl font-black text-lg text-white shadow-lg transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 transform hover:-translate-y-1"}`}
              style={!loading ? { backgroundColor: '#FF8C00' } : {}}
            >
              {loading ? "Saving..." : <><CheckCircle className="inline mr-2" /> Save & Continue</>}
            </button>
          </form>
          <div className="mt-6 text-center">
            <a href="./Login" className="text-sm font-bold text-orange-600 hover:text-orange-700 hover:underline">Back to Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}