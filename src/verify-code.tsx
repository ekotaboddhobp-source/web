// verify-code.tsx – General Verification Code (Liquid Glass)
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { showToast } from './toast';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export default function VerifyCode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email'); // URL থেকে ইমেইল নেওয়া হচ্ছে

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      showToast('সঠিক ৬ সংখ্যার কোড দিন', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (data.success) {
        showToast('ভেরিফিকেশন সফল!', 'success');
        setTimeout(() => navigate('/'), 1500);
      } else {
        showToast(data.message || 'ভুল কোড', 'error');
      }
    } catch (err) {
      showToast('সার্ভার সমস্যা', 'error');
    } finally {
      setLoading(false);
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
        
        .page-container {
          position: relative; min-height: 100dvh; display: flex; justify-content: center; align-items: center;
          padding: 20px 16px; background: linear-gradient(135deg, #f3f0ff 0%, #e8e4ff 100%); overflow: hidden;
        }
        .floating-bubble { position: absolute; z-index: 0; pointer-events: none; filter: blur(8px); animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        .main-content { width: 100%; max-width: 420px; position: relative; z-index: 10; }
        .back-btn { background: rgba(255,255,255,0.4); border: 1px solid var(--glass-border); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-dark); backdrop-filter: blur(10px); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); margin-bottom: 20px; }
        
        .glass-card {
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 24px; padding: 30px 20px; text-align: center;
          box-shadow: var(--shadow-main); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }

        .icon-bg { width: 70px; height: 70px; background: var(--primary-light); border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 15px; border: 1px solid rgba(255,255,255,0.6); }
        .title { font-size: 22px; font-weight: 800; margin-bottom: 8px; }
        .subtitle { font-size: 14px; color: var(--text-muted); margin-bottom: 25px; }

        .otp-input {
          width: 100%; background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 14px; padding: 16px; font-size: 28px; font-weight: 800; text-align: center;
          letter-spacing: 12px; color: var(--primary); outline: none; margin-bottom: 20px;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); transition: all 0.3s;
        }
        .otp-input:focus { border-color: var(--primary); background: rgba(255, 255, 255, 0.6); box-shadow: 0 0 0 3px var(--primary-light), inset 0 2px 4px rgba(255,255,255,0.5); }
        
        .submit-btn {
          display: flex; align-items: center; justify-content: center; width: 100%; background: var(--primary);
          padding: 16px; border: none; border-radius: 14px; cursor: pointer; box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3);
          color: #fff; font-size: 16px; font-weight: bold; transition: all 0.2s;
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .submit-btn:active { transform: scale(0.98); }
        
        .spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-container">
        <div className="floating-bubble" style={{ width: 150, height: 150, borderRadius: '50%', background: 'rgba(108, 99, 255, 0.25)', top: -30, left: -30 }} />
        <div className="floating-bubble" style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(255, 107, 107, 0.2)', bottom: 50, right: -30 }} />

        <div className="main-content">
          <button className="back-btn" onClick={() => navigate('/')}><FiArrowLeft size={18} /></button>
          
          <div className="glass-card">
            <div className="icon-bg"><FiMail size={32} color="#6C63FF" /></div>
            <h1 className="title">কোড ভেরিফিকেশন</h1>
            <p className="subtitle">আপনার ইমেইলে পাঠানো কোডটি দিন</p>

            <input
              type="text"
              className="otp-input"
              placeholder="------"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
            />

            <button className="submit-btn" onClick={handleVerify} disabled={loading}>
              {loading ? <span className="spinner" /> : <><FiCheckCircle size={20} style={{ marginRight: 8 }} /> যাচাই করুন</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}