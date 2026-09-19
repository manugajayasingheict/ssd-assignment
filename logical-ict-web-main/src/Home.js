// src/Home.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; //
import { db } from "./firebase"; // Your firebase config
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import ClassCard from "./ClassCard";
import { BookOpen, Facebook, Youtube, MessageCircle, Music, Menu, X,Code2,User } from "lucide-react";
import image1 from './images/image1.jpg';
import image3 from './images/image7.jpg';

import image4 from './images/image4.jpg';
import image2 from './images/image2.jpg';

import image8 from './images/2026 weda piliwala.png';

import image5 from './images/image5.png';
import image6 from './images/image6.png';
import "./Home.css"; //


export default function Home({ onLogout, userBatch }) {
  const navigate = useNavigate(); 
  const batches = ["2027AL", "2026AL", "2027OL", "2026OL", "2028AL"];
  const [selectedBatch, setSelectedBatch] = useState(userBatch || null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  // Background scrolling images
  const backgroundImages = [image2, image4, image2, image4];
  

  useEffect(() => {
    if (!selectedBatch) return;

    const fetchClasses = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "batches", selectedBatch);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const classesWithDesc = (data?.classes || []).map((cls) => ({
            ...cls,
            description: cls.description || "",
            imageUrl: cls.imageUrl || ""
          }));
          setClasses(classesWithDesc);
        } else {
          setClasses([]);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();

    // --- Fetch notifications for student's batch OR "all" ---
    const q = query(
      collection(db, "notifications"),
      where("batch", "in", [selectedBatch, "all"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          ...d,
          createdAt: d.createdAt?.toDate?.() || new Date()
        };
      });

      // Sort by newest first
      data.sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [selectedBatch]);

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden flex flex-col">
      {!selectedBatch && (
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
      )}

      {/* Navigation - Desktop */}
      <nav className="relative z-20 shadow-xl hidden lg:block" style={{ backgroundColor: '#0A3D62' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center">
          {/* Left Image */}
          <div className="flex-shrink-0 mr-6">
            <img src={image5} alt="Header Left" className="h-20 w-auto object-contain" />
          </div>

          <ul className="flex-grow flex items-center justify-between py-4 text-white list-none m-0 p-0">
            <div className="flex items-center space-x-8">
              <li
                onClick={() => {
                  setSelectedBatch(null);
                  setShowAbout(false);
                  setShowContact(false);
                }}
                className="cursor-pointer hover:text-orange-400 transition-colors font-bold flex items-center text-lg"
              >
                <BookOpen className="w-6 h-6 mr-2" />
                Home
              </li>
              {/* NEW: Coding Lab */}
              <li 
                onClick={() => navigate('/coding-lab')} 
                className="cursor-pointer flex items-center font-bold text-lg transition-colors group"
                onMouseEnter={(e) => e.currentTarget.style.color = '#FF8C00'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
              >
                <Code2 className="w-6 h-6 mr-2 text-orange-400 group-hover:text-orange-300 transition-colors" />
                Coding Lab
                <span className="ml-2 bg-orange-500 text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse text-white">
                  NEW
                </span>
              </li>
              
            </div>
            <div className="flex items-center space-x-2">
              {batches.map((batch) => (
                <li
                  key={batch}
                  onClick={() => {
                    setSelectedBatch(batch);
                    setShowAbout(false);
                    setShowContact(false);
                  }}
                  className="cursor-pointer px-4 py-2 rounded-lg transition-all font-bold"
                  style={{
                    backgroundColor: selectedBatch === batch ? '#FF8C00' : 'transparent',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBatch !== batch) {
                      e.target.style.backgroundColor = 'rgba(255, 140, 0, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBatch !== batch) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {batch}
                </li>
              ))}
              <li
                onClick={onLogout}
                className="cursor-pointer px-6 py-2 rounded-lg transition-all font-bold ml-4 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#DC2626' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#B91C1C'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#DC2626'}
              >
                Logout
              </li>
              <li 
                onClick={() => navigate('/profile')} 
                className="cursor-pointer hover:text-orange-400 transition-colors font-bold flex items-center text-lg"
              >
                <User className="w-6 h-6 mr-2" />
                Profile
              </li>
            </div>
          </ul>

          {/* Right Image - Expanded Version */}
          <div className="flex-shrink-0 ml-6 logo-right-container">
            <img 
              src={image6} 
              alt="Logical ICT Logo" 
              className="logo-right-expanded" 
            />
          </div>
        </div>
      </nav>

      {/* Navigation - Mobile */}
      <nav className="relative z-20 shadow-xl lg:hidden" style={{ backgroundColor: '#0A3D62' }}>
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <img src={image5} alt="Header Left" className="h-8 w-auto object-contain flex-shrink-0" />
            <span className="text-white font-bold text-xs truncate">LOGICAL ICT</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2 flex-shrink-0"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="px-4 pb-4 text-white max-h-screen overflow-y-auto">
            <div className="space-y-2 mb-4">
              <div
                onClick={() => {
                  setSelectedBatch(null);
                  setShowAbout(false);
                  setShowContact(false);
                  setMobileMenuOpen(false);
                }}
                className="cursor-pointer py-2 px-3 rounded-lg font-semibold flex items-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Home
              </div>
              {/* NEW: Coding Lab Link */}
              <div 
                onClick={() => {
                  navigate('/coding-lab');
                  setMobileMenuOpen(false);
                }}
                className="batch-btn py-2 px-3 flex items-center justify-between"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="flex items-center">
                  <Code2 className="w-5 h-5 mr-2 text-orange-400" />
                  Coding Lab
                </div>
                <span className="bg-orange-500 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                  NEW
                </span>
              </div>
              
            </div>
            
            <div className="border-t border-gray-600 pt-3 mb-3">
              <p className="text-xs text-gray-300 mb-2 px-3">SELECT BATCH:</p>
              {batches.map((batch) => (
                <div
                  key={batch}
                  onClick={() => {
                    setSelectedBatch(batch);
                    setShowAbout(false);
                    setShowContact(false);
                    setMobileMenuOpen(false);
                  }}
                  className="cursor-pointer py-2 px-3 rounded-lg font-bold mb-2"
                  style={{
                    backgroundColor: selectedBatch === batch ? '#FF8C00' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                >
                  {batch}
                </div>
              ))}
            </div>
            <div 
              onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
              className="batch-btn py-2 px-3 flex items-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <User className="w-5 h-5 mr-2 text-orange-400" />
              My Profile
            </div>
            <div
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="cursor-pointer py-2 px-3 rounded-lg font-bold text-center"
              style={{ backgroundColor: '#DC2626' }}
            >
              Logout
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 flex-grow">
        {/* About Page */}
        {showAbout && (
          <div className="rounded-2xl shadow-2xl p-6 sm:p-12" style={{ backgroundColor: '#1e293b' }}>
            <h1 className="text-3xl sm:text-5xl font-black mb-6 sm:mb-8 text-white">
              About Us
            </h1>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-300 text-lg sm:text-xl leading-relaxed mb-4 sm:mb-6">
                Welcome to <strong style={{ color: '#FF8C00' }}>LOGICAL ICT</strong> by Manuga Jayasinghe - Your trusted partner in ICT education excellence.
              </p>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                We provide comprehensive ICT education for O/L and A/L students, focusing on building strong foundational knowledge and practical skills that prepare students for academic success and future careers in technology.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                <div className="rounded-xl p-4 sm:p-6" style={{ backgroundColor: '#334155', borderLeft: '4px solid #FF8C00' }}>
                  <h3 className="font-black text-xl sm:text-2xl mb-2 sm:mb-3" style={{ color: '#FF8C00' }}>Our Mission</h3>
                  <p className="text-gray-300 text-sm sm:text-base">To empower students with quality ICT education and digital skills for the future.</p>
                </div>
                <div className="rounded-xl p-4 sm:p-6" style={{ backgroundColor: '#334155', borderLeft: '4px solid #FF8C00' }}>
                  <h3 className="font-black text-xl sm:text-2xl mb-2 sm:mb-3" style={{ color: '#FF8C00' }}>Our Vision</h3>
                  <p className="text-gray-300 text-sm sm:text-base">To be the leading ICT education platform in Sri Lanka.</p>
                </div>
                <div className="rounded-xl p-4 sm:p-6" style={{ backgroundColor: '#334155', borderLeft: '4px solid #FF8C00' }}>
                  <h3 className="font-black text-xl sm:text-2xl mb-2 sm:mb-3" style={{ color: '#FF8C00' }}>Our Values</h3>
                  <p className="text-gray-300 text-sm sm:text-base">Excellence, Innovation, and Student Success.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Page */}
        {showContact && (
          <div className="rounded-2xl shadow-2xl p-6 sm:p-12" style={{ backgroundColor: '#1e293b' }}>
            <h1 className="text-3xl sm:text-5xl font-black mb-6 sm:mb-8 text-white">
              Get in Touch
            </h1>
            <p className="text-gray-300 text-base sm:text-xl mb-6 sm:mb-8">
              Connect with us on your favorite platform. We're here to help you with your ICT learning journey!
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <button
                onClick={() => handleSocialClick('https://wa.me/94769643748')}
                className="rounded-xl p-4 sm:p-6 text-left transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl"
                style={{ backgroundColor: '#334155', borderLeft: '4px solid #25D366' }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-white">WhatsApp</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Chat with us directly</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSocialClick('https://www.facebook.com/manuga.official?mibextid=wwXIfr&mibextid=wwXIfr')}
                className="rounded-xl p-4 sm:p-6 text-left transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl"
                style={{ backgroundColor: '#334155', borderLeft: '4px solid #1877F2' }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Facebook className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-white">Facebook</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Follow our Facebook page</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSocialClick('https://youtube.com/@manugajayasinghe_logicalict?si=JB4QlBeJdZaZDxkh')}
                className="rounded-xl p-4 sm:p-6 text-left transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl"
                style={{ backgroundColor: '#334155', borderLeft: '4px solid #FF0000' }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                    <Youtube className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-white">YouTube</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Subscribe to our channel</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSocialClick('https://www.tiktok.com/@ict_manuga_jayasinghe?_r=1&_t=ZS-91ETiPgnydw')}
                className="rounded-xl p-4 sm:p-6 text-left transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl"
                style={{ backgroundColor: '#334155', borderLeft: '4px solid #000000' }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                    <Music className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-white">TikTok</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Follow us on TikTok</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Dashboard / Batch view */}
        {!selectedBatch && !showAbout && !showContact && (
          <div className="relative">
            <div className="backdrop-blur-md bg-white bg-opacity-95 rounded-2xl shadow-2xl p-6 sm:p-12 border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
                {/* Middle Content */}
                <div className="flex-grow w-full">
                  <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 ">
                    <span className="si">ys;kak</span> ICT - Manuga Jayasinghe
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                    Select your batch from the navigation menu to view ICT classes and notifications.
                  </p>
                  
                  {/* 2x2 Image Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <img src={image1} alt="ICT Class 1" className="w-full h-full object-contain" />
                    </div>
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <img src={image8} alt="ICT Class 2" className="w-full h-full object-contain" />
                    </div>
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <img src={image3} alt="ICT Class 3" className="w-full h-full object-contain" />
                    </div>
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <img src={image4} alt="ICT Class 4" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedBatch && (
          <>
            {/* Classes Section */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-8" style={{ borderLeft: '8px solid #FF8C00' }}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black flex items-center" style={{ color: '#0A3D62' }}>
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 mr-2 sm:mr-4 flex-shrink-0" style={{ color: '#FF8C00' }} />
                <span className="break-words">{selectedBatch} - ICT Classes</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-t-4 border-b-4" style={{ borderColor: '#FF8C00' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#0A3D62' }} />
                  </div>
                </div>
              </div>
            ) : classes?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                {classes.map((cls, index) => (
                  <ClassCard
                    key={index}
                    className={cls.name || "ICT"}
                    month={cls.month || "January"}
                    locked={cls.locked ?? true}
                    batch={cls.batch || selectedBatch}
                    description={cls.description}
                    imageUrl={cls.imageUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
                <p className="text-gray-500 text-lg sm:text-xl">No classes available for this batch.</p>
              </div>
            )}

            {/* Notifications Section */}
            
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-20 mt-auto shadow-2xl" style={{ backgroundColor: '#0A3D62' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Desktop Footer */}
          <div className="hidden lg:flex items-start gap-8">
            {/* Left Image */}
            <div className="flex-shrink-0">
              <img src={image5} alt="Footer Left" className="h-32 w-auto object-contain" />
            </div>

            {/* Middle Content */}
            <div className="flex-grow grid grid-cols-3 gap-8 text-white">
              {/* About Section */}
              <div>
                <h3 className="text-2xl font-black mb-4" style={{ color: '#FF8C00' }}>LOGICAL ICT</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Empowering students with quality ICT education for O/L and A/L examinations.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-xl font-black mb-4" style={{ color: '#FF8C00' }}>Quick Links</h3>
                <ul className="space-y-2 list-none m-0 p-0">
                  <li 
                    className="cursor-pointer transition-colors" 
                    onClick={() => {
                      setSelectedBatch(null);
                      setShowAbout(false);
                      setShowContact(false);
                    }}
                    style={{ color: 'white' }}
                    onMouseEnter={(e) => e.target.style.color = '#FF8C00'}
                    onMouseLeave={(e) => e.target.style.color = 'white'}
                  >
                    Home
                  </li>
                  <li 
                    className="cursor-pointer transition-colors" 
                    onClick={() => {
                      setShowAbout(true);
                      setShowContact(false);
                      setSelectedBatch(null);
                    }}
                    style={{ color: 'white' }}
                    onMouseEnter={(e) => e.target.style.color = '#FF8C00'}
                    onMouseLeave={(e) => e.target.style.color = 'white'}
                  >
                    About
                  </li>
                  <li 
                    className="cursor-pointer transition-colors" 
                    onClick={() => {
                      setShowContact(true);
                      setShowAbout(false);
                      setSelectedBatch(null);
                    }}
                    style={{ color: 'white' }}
                    onMouseEnter={(e) => e.target.style.color = '#FF8C00'}
                    onMouseLeave={(e) => e.target.style.color = 'white'}
                  >
                    Contact
                  </li>
                </ul>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-xl font-black mb-4" style={{ color: '#FF8C00' }}>Connect With Us</h3>
                <div className="flex space-x-4">
                  <button onClick={() => handleSocialClick('https://wa.me/94769643748')} className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleSocialClick('https://www.facebook.com/manuga.official?mibextid=wwXIfr&mibextid=wwXIfr')} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleSocialClick('https://youtube.com/@manugajayasinghe_logicalict?si=JB4QlBeJdZaZDxkh')} className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                    <Youtube className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleSocialClick('https://www.tiktok.com/@ict_manuga_jayasinghe?_r=1&_t=ZS-91ETiPgnydw')} className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                    <Music className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-shrink-0">
              <img src={image6} alt="Footer Right" className="h-32 w-auto object-contain" />
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="lg:hidden text-white space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <img src={image5} alt="LOGICAL ICT" className="h-20 w-auto object-contain" />
            </div>

            {/* About Section */}
            <div className="text-center">
              <h3 className="text-xl font-black mb-2" style={{ color: '#FF8C00' }}>LOGICAL ICT</h3>
              <p className="text-gray-300 text-sm leading-relaxed px-4">
                Empowering students with quality ICT education for O/L and A/L examinations.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h3 className="text-lg font-black mb-3" style={{ color: '#FF8C00' }}>Quick Links</h3>
              <div className="flex justify-center space-x-6 text-sm">
                <span 
                  className="cursor-pointer transition-colors" 
                  onClick={() => {
                    setSelectedBatch(null);
                    setShowAbout(false);
                    setShowContact(false);
                    window.scrollTo(0, 0);
                  }}
                >
                  Home
                </span>
                <span 
                  className="cursor-pointer transition-colors" 
                  onClick={() => {
                    setShowAbout(true);
                    setShowContact(false);
                    setSelectedBatch(null);
                    window.scrollTo(0, 0);
                  }}
                >
                  About
                </span>
                <span 
                  className="cursor-pointer transition-colors" 
                  onClick={() => {
                    setShowContact(true);
                    setShowAbout(false);
                    setSelectedBatch(null);
                    window.scrollTo(0, 0);
                  }}
                >
                  Contact
                </span>
              </div>
            </div>

            {/* Social Media */}
            <div className="text-center">
              <h3 className="text-lg font-black mb-3" style={{ color: '#FF8C00' }}>Connect With Us</h3>
              <div className="flex justify-center space-x-4">
                <button onClick={() => handleSocialClick('https://wa.me/94769643748')} className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <MessageCircle className="w-6 h-6 text-white" />
                </button>
                <button onClick={() => handleSocialClick('https://www.facebook.com/manuga.official?mibextid=wwXIfr&mibextid=wwXIfr')} className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Facebook className="w-6 h-6 text-white" />
                </button>
                <button onClick={() => handleSocialClick('https://youtube.com/@manugajayasinghe_logicalict?si=JB4QlBeJdZaZDxkh')} className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                  <Youtube className="w-6 h-6 text-white" />
                </button>
                <button onClick={() => handleSocialClick('https://www.tiktok.com/@ict_manuga_jayasinghe?_r=1&_t=ZS-91ETiPgnydw')} className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <Music className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-600 mt-6 pt-4 text-center text-gray-400 text-xs">
            <p>&copy; 2024 LOGICAL ICT by Manuga Jayasinghe. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* CSS Animation for scrolling */}
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
          display: flex;
        }
      `}</style>
    </div>
  );
}