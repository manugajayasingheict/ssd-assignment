import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  updateDoc,
  setDoc,
  doc,
  arrayUnion,
  arrayRemove,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom"; 
import { Users, LayoutDashboard, PlusCircle, Database, Video, Link, Trash2, Edit2, Save, X } from "lucide-react";
import "./AdminDashboard.css"; 

export default function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [newClass, setNewClass] = useState({ batch: "", name: "", month: "", description: "", imageURL: "" });
  const [classImage, setClassImage] = useState(null); 
  const [addingClass, setAddingClass] = useState(false);
  const [editingClassIndex, setEditingClassIndex] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [classes, setClasses] = useState([]);
  
  // Recording & Zoom States
  const [newRecording, setNewRecording] = useState({ title: "", videoId: "" });
  const [newZoom, setNewZoom] = useState({ meetingId: "", passcode: "" });
  const [editingZoomIndex, setEditingZoomIndex] = useState(null);
  const [editingZoomValue, setEditingZoomValue] = useState({ meetingId: "", passcode: "" });

  const handleSelectBatch = async (batchId) => {
    setSelectedBatch(batchId);
    if (!batchId) return setClasses([]);
    try {
      const batchRef = doc(db, "batches", batchId);
      const batchSnap = await getDoc(batchRef);
      if (batchSnap.exists()) setClasses(batchSnap.data().classes || []);
      else setClasses([]);
    } catch (err) {
      console.error("Error fetching batch classes:", err);
      setClasses([]);
    }
  };

  const handleAddOrUpdateClass = async () => {
    if (!newClass.batch || !newClass.name || !newClass.month) return alert("Please fill batch, name, and month.");
    setAddingClass(true);
    try {
      const batchRef = doc(db, "batches", newClass.batch);
      const batchSnap = await getDoc(batchRef);
      let uploadedImageURL = newClass.imageURL || ""; 

      if (classImage) {
        const storage = getStorage();
        const imageRef = ref(storage, `class-covers/${Date.now()}-${classImage.name}`);
        await uploadBytes(imageRef, classImage);
        uploadedImageURL = await getDownloadURL(imageRef);
      }

      let updatedClasses = batchSnap.exists() ? (batchSnap.data().classes || []) : [];

      if (editingClassIndex !== null) {
        updatedClasses[editingClassIndex] = {
          ...updatedClasses[editingClassIndex],
          name: newClass.name, month: newClass.month, description: newClass.description, imageURL: uploadedImageURL, 
        };
        await updateDoc(batchRef, { classes: updatedClasses });
        setClasses(updatedClasses);
        alert("Class updated successfully!");
      } else {
        const classData = { 
          name: newClass.name, month: newClass.month, description: newClass.description || "", 
          imageURL: uploadedImageURL, locked: true, recordings: [], zoomLinks: [] 
        };
        await setDoc(batchRef, { classes: arrayUnion(classData) }, { merge: true });
        if (selectedBatch === newClass.batch) setClasses((prev) => [...prev, classData]);
        alert("Class added successfully!");
      }
      setNewClass({ batch: "", name: "", month: "", description: "", imageURL: "" });
      setEditingClassIndex(null);
    } catch (err) { console.error(err); } finally { setAddingClass(false); }
  };

  const handleEditClass = (cls, index) => {
    setNewClass({ batch: selectedBatch, name: cls.name, month: cls.month, description: cls.description, imageURL: cls.imageURL || "" });
    setEditingClassIndex(index);
  };

  const handleDeleteClass = async (batchId, cls) => {
    if (!window.confirm(`Delete class ${cls.name}?`)) return;
    try {
      const batchRef = doc(db, "batches", batchId);
      await updateDoc(batchRef, { classes: arrayRemove(cls) });
      setClasses((prev) => prev.filter((c) => c.name !== cls.name || c.month !== cls.month));
    } catch (err) { console.error(err); }
  };

  // --- RECORDING LOGIC ---
  const handleAddRecording = async (clsIndex) => {
    if (!newRecording.title || !newRecording.videoId) return alert("Fill title and YouTube ID.");
    try {
      const batchRef = doc(db, "batches", selectedBatch);
      let updatedClasses = [...classes];
      if (!updatedClasses[clsIndex].recordings) updatedClasses[clsIndex].recordings = [];
      updatedClasses[clsIndex].recordings.push({ ...newRecording });
      await updateDoc(batchRef, { classes: updatedClasses });
      setClasses(updatedClasses);
      setNewRecording({ title: "", videoId: "" });
    } catch (err) { console.error(err); }
  };

  const handleDeleteRecording = async (clsIndex, recIndex) => {
    if (!window.confirm("Delete this recording?")) return;
    try {
      const batchRef = doc(db, "batches", selectedBatch);
      let updatedClasses = [...classes];
      updatedClasses[clsIndex].recordings.splice(recIndex, 1);
      await updateDoc(batchRef, { classes: updatedClasses });
      setClasses(updatedClasses);
    } catch (err) { console.error(err); }
  };

  // --- ZOOM LOGIC ---
  const handleAddZoom = async (clsIndex) => {
    if (!newZoom.meetingId) return alert("Enter Zoom Meeting ID.");
    try {
      const batchRef = doc(db, "batches", selectedBatch);
      let updatedClasses = [...classes];
      if (!updatedClasses[clsIndex].zoomLinks) updatedClasses[clsIndex].zoomLinks = [];
      updatedClasses[clsIndex].zoomLinks.push({ ...newZoom });
      await updateDoc(batchRef, { classes: updatedClasses });
      setClasses(updatedClasses);
      setNewZoom({ meetingId: "", passcode: "" });
    } catch (err) { console.error(err); }
  };

  const handleSaveZoomEdit = async (clsIndex, zoomIndex) => {
    if (!editingZoomValue.meetingId) return alert("Meeting ID required.");
    try {
      const batchRef = doc(db, "batches", selectedBatch);
      let updatedClasses = [...classes];
      updatedClasses[clsIndex].zoomLinks[zoomIndex] = { ...editingZoomValue };
      await updateDoc(batchRef, { classes: updatedClasses });
      setClasses(updatedClasses);
      setEditingZoomIndex(null);
    } catch (err) { console.error(err); }
  };

  const handleDeleteZoom = async (clsIndex, zoomIndex) => {
    if (!window.confirm("Delete this Zoom session?")) return;
    try {
      const batchRef = doc(db, "batches", selectedBatch);
      let updatedClasses = [...classes];
      updatedClasses[clsIndex].zoomLinks.splice(zoomIndex, 1);
      await updateDoc(batchRef, { classes: updatedClasses });
      setClasses(updatedClasses);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Control Center</h1>
      
      <div className="admin-nav-grid" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button onClick={() => navigate("/admin-enrollments")} className="btn-base btn-orange" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutDashboard size={18} /> Manage Enrollments
        </button>
        <button onClick={() => navigate("/admin-users")} className="btn-base btn-purple" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} /> View Student List
        </button>
        <button onClick={onLogout} className="btn-base btn-navy">Logout</button>
      </div>

      <div className="admin-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* Left Side: Add/Edit Class */}
        <section>
          <h2><PlusCircle size={20} /> {editingClassIndex !== null ? "Edit Class" : "Add New Class"}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: '10px' }}>
            <input className="input-field" type="text" placeholder="Batch ID (e.g., 2026AL)" value={newClass.batch} disabled={editingClassIndex !== null} onChange={(e)=>setNewClass({...newClass,batch:e.target.value})} />
            <input className="input-field" type="text" placeholder="Class Name" value={newClass.name} onChange={(e)=>setNewClass({...newClass,name:e.target.value})} />
            <input className="input-field" type="text" placeholder="Month" value={newClass.month} onChange={(e)=>setNewClass({...newClass,month:e.target.value})} />
            <textarea className="input-field" placeholder="Short Description" value={newClass.description} onChange={(e)=>setNewClass({...newClass,description:e.target.value})} style={{height:"80px"}} />
            <label style={{ fontSize: "12px", fontWeight: "bold" }}>Cover Image:</label>
            <input id="class-image-upload" type="file" accept="image/*" onChange={(e) => setClassImage(e.target.files[0])} className="input-field" />
            <button onClick={handleAddOrUpdateClass} disabled={addingClass} className="btn-base btn-navy">
              {addingClass ? "Saving..." : (editingClassIndex !== null ? "Update Class" : "Add Class")}
            </button>
          </div>
        </section>

        {/* Right Side: Manage Content */}
        <section>
          <h2><Database size={20} /> Manage Content</h2>
          <input className="input-field" type="text" placeholder="Type Batch ID to search classes..." value={selectedBatch} onChange={(e)=>handleSelectBatch(e.target.value)} />

          <div className="classes-grid" style={{ marginTop: '20px' }}>
            {classes.map((cls, idx) => (
              <div key={idx} className="class-card" style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '12px', background: '#fff' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  {cls.imageURL && <img src={cls.imageURL} alt="" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0 }}>{cls.name}</h3>
                    <p style={{ color: '#666', margin: '2px 0' }}>{cls.month}</p>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                      <button onClick={()=>handleEditClass(cls,idx)} className="btn-base btn-orange btn-sm"><Edit2 size={12}/> Edit Info</button>
                      <button onClick={()=>handleDeleteClass(selectedBatch,cls)} className="btn-base btn-danger btn-sm"><Trash2 size={12}/> Delete Class</button>
                    </div>
                  </div>
                </div>
                
                {/* recordings Section */}
                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                   <p><strong><Video size={14} style={{verticalAlign:'middle', marginRight:'5px'}}/> Recordings ({cls.recordings?.length || 0})</strong></p>
                   <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
                     <input className="input-field" placeholder="YouTube ID" style={{margin:0}} value={newRecording.videoId} onChange={(e)=>setNewRecording({...newRecording, videoId: e.target.value, title: `Lesson ${cls.recordings?.length + 1 || 1}`})} />
                     <button onClick={()=>handleAddRecording(idx)} className="btn-base btn-navy btn-sm" style={{whiteSpace:'nowrap'}}>Add</button>
                   </div>
                   <ul style={{listStyle:'none', padding:0}}>
                     {cls.recordings?.map((rec, rIdx) => (
                       <li key={rIdx} style={{fontSize:'13px', display:'flex', justifyContent:'between', alignItems:'center', padding:'5px 0', borderBottom:'1px dashed #eee'}}>
                         <span style={{flex:1}}>{rec.title} ({rec.videoId})</span>
                         <button onClick={()=>handleDeleteRecording(idx, rIdx)} className="btn-base btn-danger btn-sm" style={{padding:'2px 5px'}}><Trash2 size={12}/></button>
                       </li>
                     ))}
                   </ul>
                </div>

                {/* Zoom Section */}
                <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                   <p><strong><Link size={14} style={{verticalAlign:'middle', marginRight:'5px'}}/> Zoom Sessions ({cls.zoomLinks?.length || 0})</strong></p>
                   <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
                     <input className="input-field" placeholder="Meeting ID" style={{margin:0}} value={newZoom.meetingId} onChange={(e)=>setNewZoom({...newZoom, meetingId: e.target.value})} />
                     <input className="input-field" placeholder="Passcode" style={{margin:0}} value={newZoom.passcode} onChange={(e)=>setNewZoom({...newZoom, passcode: e.target.value})} />
                     <button onClick={()=>handleAddZoom(idx)} className="btn-base btn-navy btn-sm" style={{whiteSpace:'nowrap'}}>Add</button>
                   </div>
                   
                   <ul style={{listStyle:'none', padding:0}}>
                     {cls.zoomLinks?.map((z, zIdx) => (
                       <li key={zIdx} style={{fontSize:'13px', padding:'10px 0', borderBottom:'1px dashed #eee'}}>
                         {editingZoomIndex === zIdx ? (
                           <div style={{display:'flex', gap:'5px'}}>
                             <input className="input-field" value={editingZoomValue.meetingId} onChange={(e)=>setEditingZoomValue({...editingZoomValue, meetingId:e.target.value})} style={{margin:0}} />
                             <button onClick={()=>handleSaveZoomEdit(idx, zIdx)} className="btn-base btn-navy btn-sm"><Save size={12}/></button>
                             <button onClick={()=>setEditingZoomIndex(null)} className="btn-base btn-danger btn-sm"><X size={12}/></button>
                           </div>
                         ) : (
                           <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                             <span>ID: {z.meetingId} | PW: {z.passcode || 'None'}</span>
                             <div style={{display:'flex', gap:'5px'}}>
                               <button onClick={()=>{setEditingZoomIndex(zIdx); setEditingZoomValue({...z})}} className="btn-base btn-orange btn-sm" style={{padding:'2px 5px'}}><Edit2 size={12}/></button>
                               <button onClick={()=>handleDeleteZoom(idx, zIdx)} className="btn-base btn-danger btn-sm" style={{padding:'2px 5px'}}><Trash2 size={12}/></button>
                             </div>
                           </div>
                         )}
                       </li>
                     ))}
                   </ul>
                </div>

              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}