import React, { useState, useEffect } from "react";

import { auth, db, storage } from "./firebase";

import { doc, getDoc, updateDoc } from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

import { useNavigate } from "react-router-dom";

import { sendEmailVerification, signOut, reload } from "firebase/auth";

import {
  User, School, MapPin, Phone, Calendar, Mail,
  Home, CreditCard, Edit3, Save, X, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Send, LogOut, Image as ImageIcon, UploadCloud, Trash2

} from "lucide-react";

import { showSuccess, showError } from "./utils/alerts";

import "./StudentProfile.css";

export default function StudentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  // States for NIC images
  const [nicFrontFile, setNicFrontFile] = useState(null);
  const [nicBackFile, setNicBackFile] = useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          await reload(user);
          const liveVerifyStatus = user.emailVerified;
          setIsVerified(liveVerifyStatus);
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data);
            setEditData(data);
          }
        }
      } catch (err) {
        showError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      showSuccess("Logged out successfully");
      navigate("/");
    } catch (err) {
      showError("Logout failed.");
    }
  };
  const handleVerifyEmail = async () => {
    setVerifying(true);
    try {
      await sendEmailVerification(auth.currentUser);
      showSuccess("Verification link sent! Check your Gmail Inbox and Spam.");
    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        showError("Link already sent recently. Try again later.");
      } else {
        showError("Could not send email. Please try again.");
      }
    } finally {
      setVerifying(false);
    }
  };
  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      return showError("File too large! Maximum size is 2MB.");
    }
    if (side === 'front') setNicFrontFile(file);
    if (side === 'back') setNicBackFile(file);
  };
  const handleDeleteDocument = async (side) => {
    if (!window.confirm(`Delete ${side} NIC document?`)) return;
    setSaving(true);
    try {
      const user = auth.currentUser;
      const fileRef = ref(storage, `nic_documents/${user.uid}/${side}`);
      await deleteObject(fileRef);
      const docRef = doc(db, "users", user.uid);
      const updateKey = side === 'front' ? 'nicFrontUrl' : 'nicBackUrl';
      await updateDoc(docRef, { [updateKey]: null });
      const updatedProfile = { ...profile, [updateKey]: null };
      setProfile(updatedProfile);
      setEditData(updatedProfile);
      showSuccess(`${side} NIC document deleted.`);
    } catch (err) {
      showError("Failed to delete document.");
    } finally {
      setSaving(false);
    }
  };
  const validate = () => {
    const { fullName, school, district, whatsapp, address, nic, batch } = editData;
    const isOLBatch = batch?.includes("OL");
    if (!fullName?.trim()) return "Full name is required.";
    if (!school?.trim()) return "School name is required.";
    if (!district?.trim()) return "Please select your District.";
    if (!whatsapp?.trim()) return "WhatsApp number is required.";
    if (!address?.trim()) return "Delivery address is required.";
    if (!nic?.trim()) return isOLBatch ? "Parent's NIC is required." : "Student NIC is required.";
    if (!batch) return "Batch is required.";
    const whatsappPattern = /^\+94\d{9}$/;
    if (!whatsappPattern.test(whatsapp.trim())) return "Invalid WhatsApp Format! (+94771234567)";
    return null;
  };
  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    if (!isEditing) return;
    const errorMsg = validate();
    if (errorMsg) return showError(errorMsg);
    setSaving(true);
    try {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      let updatedData = {
  fullName: editData.fullName,
  school: editData.school,
  district: editData.district,
  whatsapp: editData.whatsapp,
  address: editData.address,
  nic: editData.nic,

};
      if (nicFrontFile) {
        const frontRef = ref(storage, `nic_documents/${user.uid}/front`);
        await uploadBytes(frontRef, nicFrontFile);
        updatedData.nicFrontUrl = await getDownloadURL(frontRef);
      }
      if (nicBackFile) {
        const backRef = ref(storage, `nic_documents/${user.uid}/back`);
        await uploadBytes(backRef, nicBackFile);
        updatedData.nicBackUrl = await getDownloadURL(backRef);
      }
      const finalUpdateData = updatedData;
      await updateDoc(docRef, finalUpdateData);
      setProfile((previous) => ({ ...previous, ...finalUpdateData }));
      setIsEditing(false);
      setNicFrontFile(null);
      setNicBackFile(null);
      showSuccess("Profile & Documents Updated!");
    } catch (err) {
      showError("Update failed. Check connection.");
    } finally {
      setSaving(false);
    }
  };
  if (loading) return (
    <div className="profile-loader">
      <Loader2 className="animate-spin text-orange-500" size={48} />
    </div>
  );
  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <div className="profile-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={24} />
          </button>
          <div className="avatar-section">
            <div className="avatar-circle"><User size={50} /></div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <h1 className="student-name-white">{profile?.fullName}</h1>
            {isVerified ? (
              <CheckCircle2 size={20} className="text-green-400 mt-3" title="Verified Gmail" />
            ) : (
              <AlertCircle size={20} className="text-red-400 mt-3" title="Email Not Verified" />
            )}
          </div>
          <span className="batch-badge">{profile?.batch}</span>
        </div>
        <form onSubmit={handleUpdate} className="profile-content">
          <div className="info-grid">
            <ProfileField icon={<School size={18}/>} label="School" value={profile?.school} name="school" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <ProfileField
              icon={<Mail size={18}/>} label="Email Address (Gmail)" value={profile?.email} name="email"
              isEditing={isEditing} editData={editData} setEditData={setEditData}
              isReadOnly={true} isVerified={isVerified} onVerify={handleVerifyEmail} verifying={verifying}
            />
            <ProfileField icon={<Calendar size={18}/>} label="Current Batch" value={profile?.batch} name="batch" isEditing={false} editData={editData} setEditData={setEditData} isSelect selectType="batch" />
            <ProfileField icon={<MapPin size={18}/>} label="District" value={profile?.district} name="district" isEditing={isEditing} editData={editData} setEditData={setEditData} isSelect selectType="district" />
            <ProfileField icon={<Phone size={18}/>} label="WhatsApp (+94...)" value={profile?.whatsapp} name="whatsapp" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <ProfileField icon={<CreditCard size={18}/>} label={editData?.batch?.includes("OL") ? "Parent NIC" : "Student NIC"} value={profile?.nic} name="nic" isEditing={isEditing} editData={editData} setEditData={setEditData} />
            <div className="full-width">
              <ProfileField icon={<Home size={18}/>} label="Delivery Address" value={profile?.address} name="address" isEditing={isEditing} editData={editData} setEditData={setEditData} isTextArea />
            </div>
            <div className="full-width nic-upload-section">
               <label className="field-label"><ImageIcon size={18} /> NIC Proof Documents (Max 2MB)</label>
               <div className="nic-grid">
                  <div className="nic-upload-box">
                    <span>Front Side</span>
                    {isEditing ? (
                      <label className="upload-label">
                        <UploadCloud size={20} />
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} hidden />
                        {nicFrontFile ? "Ready" : "Choose"}
                      </label>
                    ) : (
                      <div className="nic-action-row">
                        {profile?.nicFrontUrl ? (
                          <>
                            <a href={profile.nicFrontUrl} target="_blank" rel="noreferrer" className="view-link">View</a>
                            <button type="button" onClick={() => handleDeleteDocument('front')} className="delete-doc-btn"><Trash2 size={14}/></button>
                          </>
                        ) : <span className="no-file">Missing</span>}
                      </div>
                    )}
                  </div>
                  <div className="nic-upload-box">
                    <span>Back Side</span>
                    {isEditing ? (
                      <label className="upload-label">
                        <UploadCloud size={20} />
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} hidden />
                        {nicBackFile ? "Ready" : "Choose"}
                      </label>
                    ) : (
                      <div className="nic-action-row">
                        {profile?.nicBackUrl ? (
                          <>
                            <a href={profile.nicBackUrl} target="_blank" rel="noreferrer" className="view-link">View</a>
                            <button type="button" onClick={() => handleDeleteDocument('back')} className="delete-doc-btn"><Trash2 size={14}/></button>
                          </>
                        ) : <span className="no-file">Missing</span>}
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
          <div className="action-row">
            {isEditing ? (
              <div className="edit-actions-group">
                <button type="submit" disabled={saving} className="btn-save">
                  {saving ? "Uploading..." : <><Save size={20}/> Save Changes</>}
                </button>
                <button type="button" onClick={() => {setIsEditing(false); setEditData(profile); setNicFrontFile(null); setNicBackFile(null);}} className="btn-cancel">
                  <X size={20}/> Cancel
                </button>
              </div>
            ) : (
              <div className="profile-footer-actions">
                <button type="button" onClick={(e) => { e.preventDefault(); setIsEditing(true); }} className="btn-edit-full">
                  <Edit3 size={20} /> Edit Profile Details
                </button>
                <button type="button" onClick={handleLogout} className="btn-logout-profile">
                  <LogOut size={20} /> Log Out
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );

}

function ProfileField({ icon, label, value, name, isEditing, editData, setEditData, isTextArea, isSelect, selectType, isReadOnly, isVerified, onVerify, verifying }) {
  const batches = ["2026 AL", "2027 AL", "2028 AL", "2026 OL", "2027 OL"];
  const districts = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];
  const options = selectType === "batch" ? batches : districts;
  return (
    <div className="field-group">
      <label className="field-label"><span className="field-icon">{icon}</span> {label}</label>
      {isEditing ? (
        isReadOnly ? (
          <div className="field-input readonly-flex">
            <span className="text-gray-500 font-semibold truncate max-w-[45%]">{editData[name]}</span>
            <div className="flex gap-2 items-center">
               {isVerified ? (
                 <span className="verify-badge verified">VERIFIED</span>
               ) : (
                 <>
                   <span className="verify-badge unverified">UNVERIFIED</span>
                   <button type="button" onClick={onVerify} disabled={verifying} className="verify-action-btn">
                     {verifying ? "..." : <Send size={10}/>}
                   </button>
                 </>
               )}
            </div>
          </div>
        ) : isTextArea ? (
          <textarea value={editData[name] || ""} onChange={(e) => setEditData({...editData, [name]: e.target.value})} className="field-input text-area" />
        ) : isSelect ? (
          <select value={editData[name] || ""} onChange={(e) => setEditData({...editData, [name]: e.target.value})} className="field-input">
            <option value="">Select {label}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input type="text" value={editData[name] || ""} onChange={(e) => setEditData({...editData, [name]: e.target.value})} className="field-input" />
        )
      ) : (
        <div className="field-value display-flex-center justify-between">
          <span className="truncate max-w-[80%]">{value || "Not Set"}</span>
          {name === "email" && (isVerified ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-500" />)}
        </div>
      )}
    </div>
  );

}
