// index.tsx – Ekotaboddho B.P Login Screen (Liquid Glass & Scroll Fixed)
import { showToast } from './toast';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiRefreshCw, FiLogIn } from 'react-icons/fi';
import { MdVerified, MdWhatsapp } from 'react-icons/md';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

// App Open Animation
const AppOpenAnimation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className={`app-open-animation ${mounted ? 'app-open-animation--active' : ''}`}>
      {children}
    </div>
  );
};

// Floating Bubble
interface BubbleProps {
  size: number;
  color: string;
  startPos: React.CSSProperties;
  delay: number;
}

const FloatingBubble: React.FC<BubbleProps> = ({ size, color, startPos, delay }) => {
  const [yOffset, setYOffset] = useState(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    let lastTime = performance.now();
    const duration = 4000 + delay;

    const animate = (time: number) => {
      const elapsed = time - lastTime;
      const progress = (elapsed % duration) / duration;
      const offset = Math.sin(progress * Math.PI * 2) * -30;
      setYOffset(offset);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [delay]);

  return (
    <div
      className="floating-bubble"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        ...startPos,
        transform: `translateY(${yOffset}px)`,
      }}
    />
  );
};

// Success Overlay
interface SuccessOverlayProps {
  userName: string;
  onFinish: () => void;
}

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ userName, onFinish }) => {
  const [stage, setStage] = useState<'initial' | 'icon' | 'text'>('initial');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('icon'), 300);
    const t2 = setTimeout(() => setStage('text'), 700);
    const t3 = setTimeout(onFinish, 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <div className="success-overlay">
      <div className={`success-card ${stage !== 'initial' ? 'success-card--active' : ''}`}>
        <div className={`success-icon ${stage !== 'initial' ? 'success-icon--active' : ''}`}>
          <MdVerified size={80} color="#6C63FF" />
        </div>
        <div className={`success-text ${stage === 'text' ? 'success-text--active' : ''}`}>
          <h2 className="success-title">স্বাগতম!</h2>
          <p className="success-subtitle">{userName}</p>
          <p className="success-club">Ekotaboddho B.P</p>
        </div>
      </div>
    </div>
  );
};

export default function LoginScreen() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loggedUser, setLoggedUser] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      navigate('/dashboard', { replace: true });
      return;
    }
    generateCaptcha();
  };

  const generateCaptcha = useCallback(() => {
    setCaptcha({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1,
    });
    setCaptchaInput('');
  }, []);

  const validatePhone = (phone: string): boolean => /^1[0-9]{9}$/.test(phone);

  const handleLogin = async () => {
    if (!phone || !password) {
      showToast('WhatsApp নম্বর এবং পাসওয়ার্ড দুটোই দিতে হবে!', 'error');
      return;
    }
    if (!validatePhone(phone)) {
      showToast('সঠিক ১০ ডিজিটের মোবাইল নম্বর দিন (যেমন: 1712345678)', 'error');
      return;
    }
    if (parseInt(captchaInput) !== captcha.num1 + captcha.num2) {
      showToast('ভুল ক্যাপচা! সঠিক যোগফল লিখুন।', 'error');
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `+880${phone}`;
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, password }),
      });
      const data = await response.json();

      if (data.success) {
        if (data.requires2FA) {
          const token = typeof data.tempToken === 'string' ? data.tempToken : '';
          navigate(`/verify-2fa?tempToken=${encodeURIComponent(token)}`);
          return;
        }
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setLoggedUser(data.user.name);
          setShowSuccess(true);
        } else {
          showToast('লগইন ব্যর্থ: ইউজার ডাটা পাওয়া যায়নি।', 'error');
        }
      } else {
        showToast(data.message || 'লগইন ব্যর্থ: অজানা ত্রুটি', 'error');
      }
    } catch (error) {
      showToast('সার্ভারের সাথে সংযোগ সম্ভব হচ্ছে না!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const goToDashboard = () => {
    setShowSuccess(false);
    navigate('/dashboard', { replace: true });
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&display=swap');`}</style>
      <style>{`
        :root {
          --primary: #6C63FF;
          --primary-light: rgba(108, 99, 255, 0.15);
          --bg: #f3f0ff;
          
          /* ✅ Liquid Glass Updated Variables */
          --glass-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%);
          --glass-border: rgba(255, 255, 255, 0.5);
          --glass-blur: blur(25px);
          
          --text-dark: #2d2d2d;
          --text-muted: #777777;
          --text-light: #aaaaaa;
          --border: #e8e5f5;
          --border-e1: #ddd9f0;
          --shadow-soft: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
          --shadow-accent: 0 4px 15px rgba(108, 99, 255, 0.3);
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; user-select: none; }
        
        /* ✅ Scroll Fixed Logic */
        html, body {
          min-height: 100dvh; 
          width: 100%; 
          overflow-x: hidden;
          overflow-y: auto; 
        }
        
        body {
          font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: var(--bg);
          color: var(--text-dark);
        }
        
        #root { min-height: 100dvh; width: 100%; }
        
        .login-container {
          position: relative;
          min-height: 100dvh; /* Use dvh for mobile */
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px 16px;
          background: linear-gradient(135deg, #f3f0ff 0%, #e8e4ff 100%);
          overflow: hidden; /* Prevents bubbles from causing scrolling */
        }
        
        .floating-bubble {
          position: absolute;
          z-index: 1;
          pointer-events: none;
          will-change: transform;
          filter: blur(8px); /* Softer bubbles for better glass effect */
        }
        
        .app-open-animation {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          transform: scale(0.9);
          transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          margin: auto; /* keeps it centered but allows scrolling if tall */
        }
        
        .app-open-animation--active {
          opacity: 1;
          transform: scale(1);
        }
        
        .content-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .logo-container {
          text-align: center;
          margin-bottom: 24px;
        }
        
        .logo-bg {
          width: 80px;
          height: 80px;
          background: var(--glass-bg); /* Updated to liquid glass */
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 12px;
          overflow: hidden;
          box-shadow: var(--shadow-soft);
          position: relative;
        }
        
        .logo-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.6) 100%);
          animation: sheen 3s infinite;
        }
        @keyframes sheen {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
        
        .logo-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          position: relative;
          z-index: 1;
        }
        
        .title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-dark);
          line-height: 1.2;
        }
        
        .subtitle {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
          font-weight: 500;
        }
        
        /* ✅ Liquid Glass Form Card */
        .form-card {
          width: 100%;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 20px;
          box-shadow: var(--shadow-soft);
          position: relative;
          overflow: hidden;
        }
        
        .form-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg, transparent, rgba(255,255,255,0.2), transparent, rgba(255,255,255,0.2), transparent);
          animation: rotate 8s linear infinite;
          z-index: 0;
          pointer-events: none;
        }
        
        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }
        
        .input-label {
          font-size: 13px;
          font-weight: 700;
          color: #444;
          margin-bottom: 6px;
          margin-left: 5px;
          display: block;
          position: relative;
          z-index: 1;
        }
        
        /* ✅ Liquid Glass Input Group */
        .input-group {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.3); /* More transparent */
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 14px;
          margin-bottom: 14px;
          padding: 0 15px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); /* Inner glass shine */
        }
        
        .input-group:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light), inset 0 2px 4px rgba(255,255,255,0.5);
          background: rgba(255, 255, 255, 0.5);
          transform: translateY(-1px);
        }
        
        .input-icon {
          margin-right: 10px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        
        .input-field {
          flex: 1;
          padding: 15px 0;
          font-size: 16px; /* 16px prevents iOS zoom */
          color: var(--text-dark);
          background: transparent;
          border: none;
          outline: none;
          min-width: 0;
          user-select: text;
        }
        
        .input-field::placeholder { color: var(--text-light); }
        
        .phone-prefix {
          display: flex;
          align-items: center;
          font-size: 15px;
          font-weight: 600;
          color: #25D366;
          padding-right: 8px;
          border-right: 1px solid rgba(0,0,0,0.1);
          margin-right: 8px;
          white-space: nowrap;
        }
        
        .password-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          display: flex;
          align-items: center;
          color: #666;
        }
        
        /* ✅ Liquid Glass Captcha */
        .captcha-container {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        
        .captcha-label {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .captcha-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .captcha-question-bg {
          background: rgba(108, 99, 255, 0.15);
          padding: 10px 16px;
          border-radius: 10px;
          flex-shrink: 0;
        }
        
        .captcha-question-text {
          font-size: 16px;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 2px;
        }
        
        .captcha-input {
          flex: 1;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 10px;
          padding: 12px;
          font-size: 16px;
          text-align: center;
          background-color: rgba(255, 255, 255, 0.6);
          outline: none;
          min-width: 0;
          transition: border-color 0.3s ease;
          user-select: text;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .captcha-input:focus { border-color: var(--primary); background-color: #fff; }
        
        .refresh-btn {
          padding: 10px;
          background-color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 10px;
          cursor: pointer;
          flex-shrink: 0;
          transition: background-color 0.2s ease;
        }
        
        .refresh-btn:active { background-color: rgba(255, 255, 255, 0.9); }
        
        .forgot-link-wrapper {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
        }
        
        .forgot-link {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--primary);
          font-size: 13px;
          font-weight: 700;
          padding: 0;
        }
        
        .login-btn {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          width: 100%;
          background: var(--primary);
          padding: 16px;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          box-shadow: var(--shadow-accent);
          transition: all 0.2s ease;
          position: relative;
          z-index: 1;
        }
        
        .login-btn:active:not(:disabled) { transform: scale(0.98); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .login-btn-text {
          color: #fff;
          font-size: 16px;
          font-weight: bold;
        }
        
        .spinner {
          width: 22px;
          height: 22px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .footer {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          margin-top: 25px;
          gap: 5px;
          position: relative;
          z-index: 1;
        }
        
        .footer-text {
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
        }
        
        .register-link {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--primary);
          font-size: 14px;
          font-weight: 800;
          padding: 0;
        }
        
        .success-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .success-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 10px 30px rgba(108, 99, 255, 0.15);
          min-width: min(70vw, 300px);
          opacity: 0;
          transform: scale(0);
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .success-card--active { opacity: 1; transform: scale(1); }
        
        .success-icon {
          opacity: 0;
          transform: scale(0.5);
          transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .success-icon--active { opacity: 1; transform: scale(1); }
        
        .success-text {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.5s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          text-align: center;
          margin-top: 20px;
        }
        
        .success-text--active { opacity: 1; transform: translateY(0); }
        
        .success-title { font-size: 32px; font-weight: 800; color: var(--text-dark); }
        .success-subtitle { font-size: 22px; font-weight: 600; color: var(--primary); margin-top: 8px; }
        .success-club { font-size: 14px; color: var(--text-muted); margin-top: 12px; font-weight: 500; }

        @media (max-width: 360px) {
          .login-container { padding: 10px; }
          .form-card { padding: 15px; border-radius: 20px; }
          .title { font-size: 20px; }
          .captcha-row { flex-direction: column; }
          .captcha-question-bg { width: 100%; text-align: center; }
          .captcha-input { width: 100%; }
          .refresh-btn { align-self: flex-end; }
        }
      `}</style>

      <div className="login-container">
        <FloatingBubble size={150} color="rgba(108, 99, 255, 0.25)" startPos={{ top: -30, left: -30 }} delay={0} />
        <FloatingBubble size={100} color="rgba(255, 107, 107, 0.2)" startPos={{ top: 150, right: -40 }} delay={1000} />
        <FloatingBubble size={180} color="rgba(78, 205, 196, 0.2)" startPos={{ bottom: -60, left: -50 }} delay={500} />

        {showSuccess && <SuccessOverlay userName={loggedUser} onFinish={goToDashboard} />}

        <AppOpenAnimation>
          <div className="content-wrapper">
            <div className="logo-container">
              <div className="logo-bg">
                <img src="/logo.jpeg" alt="Ekotaboddho B.P Logo" />
              </div>
              <h1 className="title">Ekotaboddho B.P</h1>
              <p className="subtitle">আপনার অ্যাকাউন্টে লগইন করুন</p>
            </div>

            <div className="form-card">
              <label className="input-label">WhatsApp নম্বর</label>
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

              <label className="input-label">পাসওয়ার্ড</label>
              <div className="input-group">
                <span className="input-icon"><FiLock size={20} color="#888" /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              <div className="captcha-container">
                <p className="captcha-label">নিরাপত্তা যাচাই: আপনি মানুষ তো?</p>
                <div className="captcha-row">
                  <div className="captcha-question-bg">
                    <span className="captcha-question-text">
                      {captcha.num1} + {captcha.num2} = ?
                    </span>
                  </div>
                  <input
                    type="number"
                    className="captcha-input"
                    placeholder="যোগফল"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLogin();
                    }}
                  />
                  <button
                    type="button"
                    className="refresh-btn"
                    onClick={generateCaptcha}
                    aria-label="ক্যাপচা রিফ্রেশ করুন"
                  >
                    <FiRefreshCw size={20} color="#6C63FF" />
                  </button>
                </div>
              </div>

              <div className="forgot-link-wrapper">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => navigate('/forgot-password')}
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>

              <button
                type="button"
                className="login-btn"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <span className="login-btn-text">লগইন করুন</span>
                    <FiLogIn size={22} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </button>
            </div>

            <div className="footer">
              <span className="footer-text">অ্যাকাউন্ট নেই? </span>
              <button
                type="button"
                className="register-link"
                onClick={() => navigate('/register')}
              >
                নতুন নিবন্ধন করুন
              </button>
            </div>
          </div>
        </AppOpenAnimation>
      </div>
    </>
  );
}