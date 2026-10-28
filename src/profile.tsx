// profile.tsx – Ekotaboddho B.P User Profile (Web / Liquid Glass)
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser, FaPhone, FaTint, FaEdit, FaLock, FaFileAlt, 
  FaSignOutAlt, FaCamera, FaQrcode, FaHome, FaCalendarCheck, 
  FaVoteYea, FaArrowLeft, FaDownload, FaShareAlt
} from 'react-icons/fa';
import { MdVerified, MdLocationOn, MdEmail } from 'react-icons/md';
import { showToast } from './toast';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // ছবি আপলোড করার লজিক (Web Base64)
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_URL}/users/profile-picture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: base64Data }),
        });
        const data = await res.json();
        
        if (data.success) {
          const updatedUser = { ...userData, photoUrl: data.photoUrl };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUserData(updatedUser);
          showToast('প্রোফাইল ছবি আপডেট হয়েছে', 'success');
        } else {
          showToast(data.message || 'আপলোড ব্যর্থ', 'error');
        }
      };
    } catch (err) {
      showToast('ছবি আপলোডে সমস্যা', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('আপনি কি লগআউট করতে চান?')) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/', { replace: true });
    }
  };

  if (!userData) return null;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&display=swap');`}</style>
      <style>{`
        :root {
          --primary: #6C63FF; 
          --primary-light: rgba(108, 99, 255, 0.15);
          --bg: #f3f0ff;
          
          /* ✅ Liquid Glass Variables */
          --glass-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%);
          --glass-border: rgba(255, 255, 255, 0.5);
          --glass-blur: blur(25px);
          
          --text-dark: #2d2d2d; 
          --text-muted: #777777;
          --shadow-main: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { min-height: 100dvh; width: 100%; overflow-x: hidden; overflow-y: auto; }
        body { font-family: 'Hind Siliguri', sans-serif; background-color: var(--bg); color: var(--text-dark); }
        #root { min-height: 100dvh; width: 100%; }
        
        .profile-container {
          position: relative;
          min-height: 100dvh; display: flex; flex-direction: column; align-items: center;
          padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
          background: linear-gradient(135deg, #f3f0ff 0%, #e8e4ff 100%);
          overflow: hidden;
        }
        
        /* Background Bubbles */
        .floating-bubble {
          position: absolute; z-index: 0; pointer-events: none; filter: blur(8px);
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        .main-scroll { width: 100%; max-width: 600px; padding: 0 15px; position: relative; z-index: 10; }
        
        .header-row { display: flex; justify-content: space-between; align-items: center; margin: 20px 0 15px; }
        .back-btn { 
          background: rgba(255,255,255,0.4); border: 1px solid var(--glass-border); 
          width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
          cursor: pointer; color: var(--text-dark); backdrop-filter: blur(10px); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        .header-title { font-size: 22px; font-weight: 800; }

        /* ✅ VIP Card (Liquid Glass) */
        .vip-card {
          background: linear-gradient(135deg, rgba(30, 39, 46, 0.95), rgba(45, 52, 54, 0.9));
          backdrop-filter: var(--glass-blur);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 24px; padding: 20px; position: relative; overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.2); margin-bottom: 20px;
        }
        .watermark { position: absolute; right: -20px; bottom: -20px; font-size: 150px; color: rgba(255,255,255,0.03); pointer-events: none;}
        
        .card-header { display: flex; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 15px; gap: 12px;}
        .club-logo { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.2);}
        .club-name { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: 1px;}
        .club-sub { font-size: 11px; color: #f0a500; font-weight: 700; letter-spacing: 2px;}
        
        .card-body { display: flex; align-items: center; gap: 15px; }
        .avatar-box {
          width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--primary);
          background: #fff; display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative; flex-shrink: 0; cursor: pointer;
        }
        .avatar-box img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-box .initial { font-size: 32px; font-weight: bold; color: var(--primary); }
        .camera-icon {
          position: absolute; bottom: 0; right: 0; background: var(--primary); 
          width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
        }
        
        .user-info { flex: 1; color: #fff; }
        .user-name { font-size: 20px; font-weight: 800; margin-bottom: 2px; }
        .user-id { font-size: 13px; color: var(--primary); font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;}
        .user-detail { font-size: 12px; color: #ccc; display: flex; align-items: center; gap: 6px; margin-bottom: 3px;}
        
        .qr-section { display: flex; flex-direction: column; align-items: center; margin-top: 20px; }
        .qr-box { background: #fff; padding: 10px; border-radius: 12px; display: inline-block; }
        .qr-img { width: 100px; height: 100px; }
        
        .action-btns { display: flex; justify-content: space-around; margin-top: 15px; }
        .action-btn { 
          display: flex; align-items: center; gap: 6px; background: rgba(108, 99, 255, 0.2); 
          color: #fff; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;
          border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
        }

        /* ✅ Settings List */
        .settings-section {
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 24px; padding: 10px 20px; margin-bottom: 20px;
          box-shadow: var(--shadow-main); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        .section-title { font-size: 16px; font-weight: 800; color: #444; margin: 10px 0 15px; }
        
        .setting-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 15px 0; border-bottom: 1px solid rgba(0,0,0,0.05); cursor: pointer;
        }
        .setting-row:last-child { border-bottom: none; }
        
        .setting-left { display: flex; align-items: center; gap: 12px; }
        .icon-bg { 
          width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.5); box-shadow: inset 0 2px 4px rgba(255,255,255,0.6);
        }
        .setting-text { font-size: 15px; font-weight: 600; color: #333; }
        
        /* ✅ Bottom Nav */
        .bottom-nav-container { 
          position: fixed; bottom: 0; left: 0; right: 0; height: calc(70px + env(safe-area-inset-bottom, 0px));
          padding-bottom: env(safe-area-inset-bottom, 0px); backdrop-filter: blur(25px); background: rgba(255,255,255,0.7);
          border-top: 1px solid var(--glass-border); display: flex; justify-content: space-around; align-items: center; z-index: 900; 
        }
        .nav-item { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 25%; background: none; border: none; cursor: pointer; }
        .nav-icon-circle { width: 40px; height: 40px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; margin-bottom: 2px; transition: background 0.3s;}
        .nav-text { font-size: 11px; color: #666; font-weight: 600; }
        .nav-text-active { color: var(--primary); font-weight: 800; }
      `}</style>

      <div className="profile-container">
        {/* Background Bubbles */}
        <div className="floating-bubble" style={{ width: 150, height: 150, borderRadius: '50%', background: 'rgba(108, 99, 255, 0.25)', top: -30, left: -30, animationDelay: '0s' }} />
        <div className="floating-bubble" style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255, 107, 107, 0.2)', top: 150, right: -40, animationDelay: '1s' }} />

        <div className="main-scroll">
          <div className="header-row">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              <FaArrowLeft size={18} />
            </button>
            <h1 className="header-title">আমার প্রোফাইল</h1>
            <div style={{ width: 44 }} /> {/* Spacer */}
          </div>

          {/* VIP Digital ID Card */}
          <div className="vip-card">
            <div className="watermark"><FaQrcode /></div>
            
            <div className="card-header">
              <img src="/logo.jpeg" alt="Logo" className="club-logo" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/45?text=BP'; }} />
              <div>
                <div className="club-name">Ekotaboddho B.P</div>
                <div className="club-sub">VIP MEMBERSHIP</div>
              </div>
              {userData.approved && <MdVerified size={24} color="#f0a500" style={{ marginLeft: 'auto' }} />}
            </div>

            <div className="card-body">
              <div className="avatar-box" onClick={() => fileInputRef.current?.click()}>
                {userData.photoUrl ? (
                  <img src={userData.photoUrl} alt="Profile" />
                ) : (
                  <span className="initial">{userData.name?.charAt(0) || 'U'}</span>
                )}
                <div className="camera-icon"><FaCamera size={12} color="#fff" /></div>
              </div>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
              
              <div className="user-info">
                <div className="user-name">{userData.name}</div>
                <div className="user-id"><MdVerified size={14}/> ID: {userData.memberId || (userData.approved ? 'N/A' : 'পেন্ডিং...')}</div>
                <div className="user-detail"><MdLocationOn size={14}/> {userData.area || userData.district || 'N/A'}</div>
                <div className="user-detail"><FaTint size={12} color="#ff4757"/> রক্ত: <span style={{ color: '#ff4757', fontWeight: 'bold' }}>{userData.bloodGroup || 'N/A'}</span></div>
              </div>
            </div>

            {/* Dummy QR for Web */}
            <div className="qr-section">
              <div className="qr-box">
                {/* Placeholder for QR code */}
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${userData.memberId || 'N/A'}`} alt="QR" className="qr-img" />
              </div>
            </div>

            <div className="action-btns">
              <button className="action-btn"><FaDownload /> ডাউনলোড</button>
              <button className="action-btn"><FaShareAlt /> শেয়ার</button>
            </div>
          </div>

          {/* Settings Options */}
          <div className="settings-section">
            <div className="section-title">একাউন্ট সেটিংস</div>
            
            <div className="setting-row" onClick={() => navigate('/profile/edit')}>
              <div className="setting-left">
                <div className="icon-bg"><FaUser size={20} color="#6C63FF" /></div>
                <span className="setting-text">ব্যক্তিগত তথ্য আপডেট</span>
              </div>
              <span>›</span>
            </div>

            <div className="setting-row" onClick={() => navigate('/profile/password')}>
              <div className="setting-left">
                <div className="icon-bg"><FaLock size={20} color="#f0a500" /></div>
                <span className="setting-text">পাসওয়ার্ড পরিবর্তন</span>
              </div>
              <span>›</span>
            </div>

            <div className="setting-row" onClick={() => navigate('/rules')}>
              <div className="setting-left">
                <div className="icon-bg"><FaFileAlt size={20} color="#2ed573" /></div>
                <span className="setting-text">ক্লাবের নীতিমালা</span>
              </div>
              <span>›</span>
            </div>
            
            <div className="setting-row" onClick={handleLogout}>
              <div className="setting-left">
                <div className="icon-bg" style={{ background: 'rgba(255, 71, 87, 0.1)' }}><FaSignOutAlt size={20} color="#ff4757" /></div>
                <span className="setting-text" style={{ color: '#ff4757' }}>লগআউট করুন</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav-container">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <div className="nav-icon-circle"><FaHome size={22} color="#666" /></div>
            <span className="nav-text">হোম</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/poll')}>
            <div className="nav-icon-circle"><FaVoteYea size={20} color="#666" /></div>
            <span className="nav-text">পোল</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/events')}>
            <div className="nav-icon-circle"><FaCalendarCheck size={22} color="#666" /></div>
            <span className="nav-text">ইভেন্ট</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/profile')}>
            <div className="nav-icon-circle" style={{ background: 'var(--primary-light)' }}><FaUser size={22} color="var(--primary)" /></div>
            <span className="nav-text-active">প্রোফাইল</span>
          </button>
        </div>
      </div>
    </>
  );
}