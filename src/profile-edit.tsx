// profile-edit.tsx – Ekotaboddho B.P Edit Profile (Liquid Glass)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaPhone, FaMapMarkerAlt, FaTint, FaCheckCircle } from 'react-icons/fa';
import { showToast } from './toast';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export default function EditProfileScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bloodGroup: '',
    fatherName: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      const u = JSON.parse(storedUser);
      setFormData({
        name: u.name || '',
        phone: u.phone || '',
        address: u.address || '',
        bloodGroup: u.bloodGroup || '',
        fatherName: u.fatherName || '',
      });
      setUserId(u._id);
    } else {
      showToast('সেশন শেষ, আবার লগইন করুন', 'error');
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('নাম এবং ফোন নম্বর অবশ্যই দিতে হবে', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        // লোকাল স্টোরেজে ইউজার আপডেট
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...storedUser, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        showToast('প্রোফাইল সফলভাবে আপডেট হয়েছে!', 'success');
        setTimeout(() => navigate(-1), 1500); // ১.৫ সেকেন্ড পর ফিরে যাবে
      } else {
        showToast(data.message || 'আপডেট ব্যর্থ হয়েছে', 'error');
      }
    } catch (err) {
      showToast('সার্ভার সমস্যা, পরে চেষ্টা করুন', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&display=swap');`}</style>
      <style>{`
        :root {
          --primary: #6C63FF; --primary-light: rgba(108, 99, 255, 0.15);
          --bg: #f3f0ff;
          --glass-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%);
          --glass-border: rgba(255, 255, 255, 0.5);
          --glass-blur: blur(25px);
          --text-dark: #2d2d2d; --text-muted: #777;
          --shadow-main: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { min-height: 100dvh; width: 100%; overflow-x: hidden; overflow-y: auto; }
        body { font-family: 'Hind Siliguri', sans-serif; background-color: var(--bg); color: var(--text-dark); }
        #root { min-height: 100dvh; width: 100%; }
        
        .page-container {
          position: relative; min-height: 100dvh; display: flex; flex-direction: column; align-items: center;
          padding: 20px 16px; background: linear-gradient(135deg, #f3f0ff 0%, #e8e4ff 100%); overflow: hidden;
        }
        .floating-bubble { position: absolute; z-index: 0; pointer-events: none; filter: blur(8px); animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        .main-content { width: 100%; max-width: 480px; position: relative; z-index: 10; }
        .header-row { display: flex; align-items: center; margin-bottom: 20px; }
        .back-btn { background: rgba(255,255,255,0.4); border: 1px solid var(--glass-border); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-dark); backdrop-filter: blur(10px); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); }
        .header-title { font-size: 20px; font-weight: 800; margin-left: 15px; }

        .glass-card {
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 24px; padding: 24px; margin-bottom: 20px;
          box-shadow: var(--shadow-main); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }

        .input-group { display: flex; align-items: center; background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(10px); border-radius: 14px; margin-bottom: 16px; padding: 0 15px; border: 1px solid rgba(255, 255, 255, 0.6); transition: all 0.3s ease; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); }
        .input-group:focus-within { border-color: var(--primary); background: rgba(255, 255, 255, 0.5); box-shadow: 0 0 0 3px var(--primary-light), inset 0 2px 4px rgba(255,255,255,0.5); }
        .input-icon { color: #666; margin-right: 12px; }
        .input-field { flex: 1; padding: 16px 0; font-size: 16px; color: var(--text-dark); background: transparent; border: none; outline: none; }
        .input-field::placeholder { color: #999; }
        
        textarea.input-field { resize: none; height: 80px; padding-top: 16px; font-family: inherit; }

        .submit-btn {
          display: flex; align-items: center; justify-content: center; width: 100%; background: var(--primary);
          padding: 16px; border: none; border-radius: 16px; cursor: pointer; box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3);
          transition: all 0.2s ease; color: #fff; font-size: 16px; font-weight: 700;
        }
        .submit-btn:active { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-container">
        <div className="floating-bubble" style={{ width: 150, height: 150, borderRadius: '50%', background: 'rgba(108, 99, 255, 0.25)', top: -30, left: -30 }} />
        <div className="floating-bubble" style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(78, 205, 196, 0.2)', bottom: 50, right: -30 }} />

        <div className="main-content">
          <div className="header-row">
            <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft size={18} /></button>
            <h1 className="header-title">প্রোফাইল এডিট</h1>
          </div>

          <form onSubmit={handleUpdate} className="glass-card">
            <div className="input-group">
              <FaUser className="input-icon" size={18} />
              <input type="text" className="input-field" placeholder="পূর্ণ নাম *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            
            <div className="input-group">
              <FaPhone className="input-icon" size={18} />
              <input type="tel" className="input-field" placeholder="ফোন নম্বর *" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>

            <div className="input-group">
              <FaMapMarkerAlt className="input-icon" size={18} />
              <textarea className="input-field" placeholder="ঠিকানা" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>

            <div className="input-group">
              <FaTint className="input-icon" size={18} />
              <input type="text" className="input-field" placeholder="রক্তের গ্রুপ (যেমন: B+)" value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} />
            </div>

            <div className="input-group">
              <FaUser className="input-icon" size={18} />
              <input type="text" className="input-field" placeholder="পিতার নাম" value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? <span className="spinner" /> : <><FaCheckCircle size={20} style={{ marginRight: 8 }} /> আপডেট করুন</>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}