// profile-password.tsx – Ekotaboddho B.P Change Password (Liquid Glass)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ FaEyeOff এর বদলে FaEyeSlash ইমপোর্ট করা হলো
import { FaArrowLeft, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { showToast } from './toast';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export default function ChangePasswordScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oldPass || !newPass || !confirmPass) {
      showToast('সবগুলো ঘর পূরণ করুন', 'error');
      return;
    }
    if (newPass.length < 6) {
      showToast('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: storedUser._id,
          oldPassword: oldPass,
          newPassword: newPass,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!', 'success');
        setTimeout(() => navigate(-1), 1500);
      } else {
        showToast(data.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে', 'error');
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
        .password-toggle { background: none; border: none; cursor: pointer; color: #666; padding: 5px; display: flex; align-items: center; }

        .submit-btn {
          display: flex; align-items: center; justify-content: center; width: 100%; background: #f0a500;
          padding: 16px; border: none; border-radius: 16px; cursor: pointer; box-shadow: 0 4px 15px rgba(240, 165, 0, 0.3);
          transition: all 0.2s ease; color: #fff; font-size: 16px; font-weight: 700;
        }
        .submit-btn:active { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-container">
        <div className="floating-bubble" style={{ width: 150, height: 150, borderRadius: '50%', background: 'rgba(240, 165, 0, 0.2)', top: -30, left: -30 }} />
        <div className="floating-bubble" style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(108, 99, 255, 0.2)', bottom: 50, right: -30 }} />

        <div className="main-content">
          <div className="header-row">
            <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft size={18} /></button>
            <h1 className="header-title">পাসওয়ার্ড পরিবর্তন</h1>
          </div>

          <form onSubmit={handleChangePass} className="glass-card">
            <div className="input-group">
              <FaLock className="input-icon" size={18} />
              <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="বর্তমান পাসওয়ার্ড" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
            </div>

            <div className="input-group">
              <FaLock className="input-icon" size={18} />
              <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="নতুন পাসওয়ার্ড" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
              <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                {/* ✅ এখানে FaEyeSlash ব্যবহার করা হলো */}
                {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <div className="input-group">
              <FaLock className="input-icon" size={18} />
              <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="নতুন পাসওয়ার্ড আবার লিখুন" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? <span className="spinner" /> : <><FaShieldAlt size={20} style={{ marginRight: 8 }} /> পরিবর্তন করুন</>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}