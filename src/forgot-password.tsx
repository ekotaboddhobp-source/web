// forgot-password.tsx – Ekotaboddho B.P Forgot Password (Liquid Glass & Email OTP)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiRefreshCw, FiMail } from 'react-icons/fi';
import { MdWhatsapp } from 'react-icons/md';
import { showToast } from './toast';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp' | 'newPassword'>('phone');

  // Phone state
  const [phone, setPhone] = useState('');

  // OTP state
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // New password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Captcha state
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  const generateCaptcha = () => {
    setCaptcha({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1,
    });
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const validatePhone = (phone: string): boolean => /^1[0-9]{9}$/.test(phone);

  // Step 1: Phone submit → OTP পাঠানো
  const handlePhoneSubmit = async () => {
    if (!validatePhone(phone)) {
      showToast('সঠিক ১০ ডিজিটের WhatsApp নম্বর দিন', 'error');
      return;
    }
    if (parseInt(captchaInput) !== captcha.num1 + captcha.num2) {
      showToast('ভুল ক্যাপচা! সঠিক যোগফল লিখুন।', 'error');
      generateCaptcha();
      return;
    }

    const fullPhone = `+880${phone}`;

    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setTempToken(data.tempToken || '');
        setStep('otp');
        showToast('আপনার রেজিস্টার্ড ইমেইলে OTP পাঠানো হয়েছে', 'success');
      } else {
        showToast(data.message || 'OTP পাঠানো ব্যর্থ', 'error');
      }
    } catch (err) {
      showToast('সার্ভার সমস্যা', 'error');
    }
  };

  // Step 2: OTP verify
  const handleOtpVerify = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      showToast('৬ সংখ্যার OTP দিন', 'error');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch(`${API_URL}/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otp: otp.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTempToken(data.resetToken || tempToken);
        setStep('newPassword');
        showToast('OTP যাচাই সফল', 'success');
      } else {
        showToast(data.message || 'OTP ভুল', 'error');
      }
    } catch (err) {
      showToast('সার্ভার সমস্যা', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 3: New password set
  const handlePasswordSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      showToast('উভয় পাসওয়ার্ড দিন', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('পাসওয়ার্ড দুটি মেলেনি', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tempToken, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!', 'success');
        setTimeout(() => navigate('/', { replace: true }), 1500);
      } else {
        showToast(data.message || 'রিসেট ব্যর্থ', 'error');
      }
    } catch (err) {
      showToast('সার্ভার সমস্যা', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

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
          --text-light: #aaaaaa;
          --border: #e8e5f5;
          --shadow-main: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
          --shadow-accent: 0 4px 15px rgba(108, 99, 255, 0.3);
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; user-select: none; }
        
        html, body { min-height: 100dvh; width: 100%; overflow-x: hidden; overflow-y: auto; }
        body {
          font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
          background-color: var(--bg); color: var(--text-dark);
        }
        #root { min-height: 100dvh; width: 100%; }
        
        .forgot-container {
          position: relative;
          min-height: 100dvh; width: 100%; display: flex; justify-content: center; align-items: center;
          padding: 20px 16px; background: linear-gradient(135deg, #f3f0ff 0%, #e8e4ff 100%);
          overflow: hidden;
        }
        
        /* Background Bubbles */
        .floating-bubble {
          position: absolute; z-index: 0; pointer-events: none; filter: blur(8px);
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        .forgot-wrapper { width: 100%; max-width: 480px; margin: auto; display: flex; flex-direction: column; position: relative; z-index: 10; }
        
        .header-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; position: relative; }
        
        .back-btn {
          position: absolute; left: 0; top: 0; background: rgba(255,255,255,0.4);
          backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 50%; width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); transition: background-color 0.2s ease; z-index: 10;
        }
        
        .logo-bg {
          width: 80px; height: 80px; background: var(--glass-bg);
          backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 50%;
          display: flex; justify-content: center; align-items: center; margin-bottom: 12px;
          overflow: hidden; box-shadow: var(--shadow-main); position: relative;
        }
        .logo-bg img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; position: relative; z-index: 1;}
        
        .title { font-size: 24px; font-weight: 800; color: var(--text-dark); text-align: center; }
        .subtitle { font-size: 14px; color: var(--text-muted); margin-top: 4px; font-weight: 500; text-align: center; }
        
        /* Step Indicator */
        .step-indicator { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
        .step-dot { width: 10px; height: 10px; border-radius: 50%; background-color: #ccc; transition: all 0.3s ease; }
        .step-dot.active { background-color: var(--primary); transform: scale(1.2); box-shadow: 0 0 10px var(--primary-light); }
        
        /* ✅ Liquid Glass Form Card */
        .form-card {
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 24px; padding: 24px; margin-bottom: 12px;
          box-shadow: var(--shadow-main); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        
        .notice-text { font-size: 13px; color: #666; margin-bottom: 20px; text-align: center; line-height: 1.5; }
        
        /* ✅ Liquid Glass Input Group */
        .input-group {
          display: flex; align-items: center; background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px); border-radius: 14px; margin-bottom: 16px; padding: 0 15px;
          border: 1px solid rgba(255, 255, 255, 0.6); transition: all 0.3s ease;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        .input-group:focus-within { border-color: var(--primary); background: rgba(255, 255, 255, 0.5); box-shadow: 0 0 0 3px var(--primary-light), inset 0 2px 4px rgba(255,255,255,0.5); }
        
        .input-icon { margin-right: 12px; flex-shrink: 0; display: flex; align-items: center; }
        .input-field { flex: 1; padding: 16px 0; font-size: 16px; color: var(--text-dark); background: transparent; border: none; outline: none; min-width: 0; user-select: text; }
        .input-field::placeholder { color: var(--text-light); }
        
        .phone-prefix { display: flex; align-items: center; font-size: 15px; font-weight: 600; color: #25D366; padding-right: 8px; border-right: 1px solid rgba(0,0,0,0.1); margin-right: 8px; white-space: nowrap; }
        .password-toggle { background: none; border: none; cursor: pointer; padding: 5px; display: flex; align-items: center; color: #888; }
        
        /* ✅ Liquid Glass Captcha Container */
        .captcha-container {
          background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 16px; padding: 14px; margin-bottom: 20px; position: relative; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        .captcha-label { font-size: 12px; color: var(--text-muted); font-weight: 700; margin-bottom: 10px; }
        .captcha-row { display: flex; align-items: center; gap: 10px; }
        .captcha-question-bg { background-color: var(--primary-light); padding: 10px 16px; border-radius: 10px; flex-shrink: 0; }
        .captcha-question-text { font-size: 16px; font-weight: 800; color: var(--primary); letter-spacing: 2px; }
        .captcha-input {
          flex: 1; border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 10px; padding: 12px;
          font-size: 16px; text-align: center; background-color: rgba(255, 255, 255, 0.6); outline: none; min-width: 0;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); transition: border-color 0.3s ease;
        }
        .captcha-input:focus { border-color: var(--primary); background-color: #fff; }
        .refresh-btn { padding: 10px; background-color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.8); border-radius: 10px; cursor: pointer; flex-shrink: 0; }
        
        /* Submit Button */
        .submit-btn {
          display: flex; align-items: center; justify-content: center; width: 100%; background-color: var(--primary);
          padding: 16px; border: none; border-radius: 16px; cursor: pointer; box-shadow: var(--shadow-accent);
          transition: all 0.2s ease;
        }
        .submit-btn:active { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .submit-btn-text { color: #fff; font-size: 16px; font-weight: bold; }
        
        .spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        @media (max-width: 360px) {
          .forgot-container { padding: 10px; }
          .form-card { padding: 18px; border-radius: 20px; }
          .captcha-row { flex-direction: column; gap: 8px; }
          .captcha-question-bg { width: 100%; text-align: center; }
          .captcha-input { width: 100%; margin: 0; }
          .refresh-btn { align-self: flex-end; }
        }
      `}</style>

      <div className="forgot-container">
        {/* Background Bubbles */}
        <div className="floating-bubble" style={{ width: 150, height: 150, borderRadius: '50%', background: 'rgba(108, 99, 255, 0.25)', top: -30, left: -30, animationDelay: '0s' }} />
        <div className="floating-bubble" style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255, 107, 107, 0.2)', top: 150, right: -40, animationDelay: '1s' }} />
        <div className="floating-bubble" style={{ width: 180, height: 180, borderRadius: '50%', background: 'rgba(78, 205, 196, 0.2)', bottom: -60, left: -50, animationDelay: '0.5s' }} />

        <div className="forgot-wrapper">
          <div className="header-container">
            <button type="button" className="back-btn" onClick={() => navigate(-1)} aria-label="পিছনে যান">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div className="logo-bg"><img src="/logo.jpeg" alt="Ekotaboddho B.P Logo" /></div>
            <h1 className="title">পাসওয়ার্ড রিসেট</h1>
            <p className="subtitle">
              {step === 'phone' && 'আপনার রেজিস্টার্ড WhatsApp নম্বর দিন'}
              {step === 'otp' && 'OTP যাচাই করুন'}
              {step === 'newPassword' && 'নতুন পাসওয়ার্ড সেট করুন'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step-dot ${step === 'phone' || step === 'otp' || step === 'newPassword' ? 'active' : ''}`} />
            <div className={`step-dot ${step === 'otp' || step === 'newPassword' ? 'active' : ''}`} />
            <div className={`step-dot ${step === 'newPassword' ? 'active' : ''}`} />
          </div>

          {step === 'phone' && (
            <div className="form-card">
              <p className="notice-text">
                নম্বরটি দেওয়ার পর আপনার রেজিস্টার্ড <strong>ইমেইলে</strong> একটি OTP পাঠানো হবে।
              </p>

              <div className="input-group">
                <span className="input-icon"><MdWhatsapp size={20} color="#25D366" /></span>
                <span className="phone-prefix">+880</span>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="1XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  maxLength={10}
                />
              </div>

              <div className="captcha-container">
                <p className="captcha-label">নিরাপত্তা যাচাই: আপনি মানুষ তো?</p>
                <div className="captcha-row">
                  <div className="captcha-question-bg">
                    <span className="captcha-question-text">{captcha.num1} + {captcha.num2} = ?</span>
                  </div>
                  <input
                    type="number"
                    className="captcha-input"
                    placeholder="যোগফল"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                  />
                  <button type="button" className="refresh-btn" onClick={generateCaptcha} aria-label="রিফ্রেশ">
                    <FiRefreshCw size={20} color="#6C63FF" />
                  </button>
                </div>
              </div>

              <button type="button" className="submit-btn" onClick={handlePhoneSubmit}>
                <span className="submit-btn-text">OTP পাঠান</span>
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="form-card">
              <div className="input-group">
                <span className="input-icon"><FiMail size={20} color="#6C63FF" /></span>
                <input
                  type="text"
                  className="input-field"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  style={{ letterSpacing: 8, textAlign: 'center', fontSize: 22, fontWeight: 'bold' }}
                />
              </div>

              <button type="button" className="submit-btn" onClick={handleOtpVerify} disabled={otpLoading}>
                {otpLoading ? <span className="spinner" /> : <span className="submit-btn-text">যাচাই করুন</span>}
              </button>
            </div>
          )}

          {step === 'newPassword' && (
            <div className="form-card">
              <div className="input-group">
                <span className="input-icon"><FiLock size={20} color="#888" /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="নতুন পাসওয়ার্ড"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              <div className="input-group">
                <span className="input-icon"><FiLock size={20} color="#888" /></span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              <button type="button" className="submit-btn" onClick={handlePasswordSubmit} disabled={passwordLoading}>
                {passwordLoading ? <span className="spinner" /> : <span className="submit-btn-text">পাসওয়ার্ড পরিবর্তন করুন</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}