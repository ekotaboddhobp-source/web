// register.tsx – Ekotaboddho B.P Registration (Web)
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiRefreshCw, FiArrowRight, FiMapPin, FiEye, FiEyeOff, FiSearch, FiMail, FiHome } from 'react-icons/fi';
import { MdWhatsapp } from 'react-icons/md';
import { showToast } from './toast';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const areas = [
  'চেয়ারম্যান লেইন',
  'হাজী আবুল হোসেন সওদাগর লেইন',
  'এয়াকুব শাহ্ লেইন',
  'হাজী গোলাম রহমান লেইন',
  'অন্যান্য'
];

const TICK_SOUND = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

interface WheelPickerProps {
  items: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const WheelPicker: React.FC<WheelPickerProps> = ({ items, selectedValue, onSelect, onClose }) => {
  const [tempSelected, setTempSelected] = useState(selectedValue);
  const [searchTerm, setSearchTerm] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  const ITEM_HEIGHT = 48;

  const filteredItems = searchTerm.trim()
    ? items.filter(item => item.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    : items;

  const playTick = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    audioRef.current = new Audio(TICK_SOUND);
  }, []);

  const handleScroll = () => {
    if (!listRef.current) return;
    const list = listRef.current;
    const centerIndex = Math.round(list.scrollTop / ITEM_HEIGHT);
    
    if (filteredItems[centerIndex] && filteredItems[centerIndex] !== tempSelected) {
      setTempSelected(filteredItems[centerIndex]);
      playTick();
    }

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      list.scrollTo({
        top: centerIndex * ITEM_HEIGHT,
        behavior: 'smooth'
      });
    }, 100);
  };

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    
    const index = filteredItems.indexOf(selectedValue);
    if (index >= 0) {
      list.scrollTop = index * ITEM_HEIGHT;
    } else {
      list.scrollTop = 0;
    }

    list.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      list.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [filteredItems]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
      if (filteredItems.length > 0) setTempSelected(filteredItems[0]);
    }
  }, [searchTerm]);

  const handleItemClick = (item: string, index: number) => {
    setTempSelected(item);
    playTick();
    if (listRef.current) {
      listRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth'
      });
    }
  };

  const handleConfirm = () => {
    if (tempSelected) onSelect(tempSelected);
    onClose();
  };

  return (
    <div className="wheel-overlay" onClick={onClose}>
      <div className="wheel-container" onClick={(e) => e.stopPropagation()}>
        <div className="wheel-header">
          <button className="wheel-cancel" onClick={onClose}>বাতিল</button>
          <span className="wheel-title">এলাকা নির্বাচন করুন</span>
          <button className="wheel-done" onClick={handleConfirm}>ঠিক আছে</button>
        </div>
        <div className="wheel-search">
          <FiSearch size={18} color="#888" />
          <input type="text" placeholder="এলাকা খুঁজুন..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="wheel-body">
          <div className="wheel-highlight" />
          <div className="wheel-list" ref={listRef}>
            {filteredItems.length === 0 ? (
              <div className="wheel-no-result">কোনো এলাকা পাওয়া যায়নি</div>
            ) : (
              filteredItems.map((item, index) => (
                <div 
                  key={item} 
                  className={`wheel-item ${tempSelected === item ? 'wheel-item-selected' : ''}`} 
                  onClick={() => handleItemClick(item, index)}
                >
                  {item}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RegisterScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fatherName: '',
    area: '',
    customArea: '',
    houseName: '',
    password: '',
    confirmPassword: '',
  });
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [showWheel, setShowWheel] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ ফিক্স: পেজ রিফ্রেশ হলে চেক করবে সেশনে ইমেইল আছে কি না
  useEffect(() => {
    generateCaptcha();
    const savedEmail = sessionStorage.getItem('tempEmail');
    if (savedEmail) {
      setTempEmail(savedEmail);
      setShowOtpSection(true);
    }
  }, []);

  const generateCaptcha = useCallback(() => {
    setCaptcha({ num1: Math.floor(Math.random() * 10) + 1, num2: Math.floor(Math.random() * 10) + 1 });
    setCaptchaInput('');
  }, []);

  const validatePhone = (phone: string): boolean => /^1[0-9]{9}$/.test(phone);

  const handleRegister = async () => {
    if (!formData.name || !formData.phone || !formData.password || !formData.email) {
      showToast('নাম, ইমেইল, WhatsApp নম্বর এবং পাসওয়ার্ড দিন', 'error');
      return;
    }
    if (!formData.area) {
      showToast('এলাকা নির্বাচন করুন', 'error');
      return;
    }
    if (formData.area === 'অন্যান্য' && !formData.customArea.trim()) {
      showToast('আপনার এলাকার নাম লিখুন', 'error');
      return;
    }
    if (!validatePhone(formData.phone)) {
      showToast('সঠিক ১০ ডিজিটের নম্বর দিন', 'error');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('পাসওয়ার্ড মেলেনি', 'error');
      return;
    }
    if (parseInt(captchaInput) !== captcha.num1 + captcha.num2) {
      generateCaptcha();
      showToast('ভুল ক্যাপচা', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `+880${formData.phone}`;
      const finalArea = formData.area === 'অন্যান্য' ? formData.customArea : formData.area;

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: fullPhone,
          fatherName: formData.fatherName,
          area: finalArea,
          houseName: formData.houseName,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setTempEmail(data.email);
        // ✅ ফিক্স: ইমেইল সেশন স্টোরেজে সেভ করে রাখা
        sessionStorage.setItem('tempEmail', data.email);
        setShowOtpSection(true);
        showToast('আপনার ইমেইলে OTP পাঠানো হয়েছে। ইমেইল চেক করুন।', 'success');
      } else {
        showToast(data.message || 'সমস্যা হয়েছে', 'error');
      }
    } catch (err) {
      showToast('সার্ভার সমস্যা', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otp.trim() || otp.trim().length !== 6) return showToast('৬ সংখ্যার OTP দিন', 'error');
    setOtpLoading(true);
    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempEmail, otp: otp.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('ইমেইল ভেরিফিকেশন সফল! 🎉 এখন লগইন করুন।', 'success');
        // ✅ ফিক্স: ভেরিফাই সফল হলে সেশন থেকে ইমেইল মুছে ফেলা
        sessionStorage.removeItem('tempEmail');
        navigate('/', { replace: true });
      } else {
        showToast(data.message || 'OTP ভুল', 'error');
      }
    } catch (err) { 
      showToast('সার্ভার সমস্যা', 'error'); 
    } finally { 
      setOtpLoading(false); 
    }
  };

  // ✅ ফিক্স: OTP সেকশন থেকে ফিরে গেলে সেশন ক্লিয়ার করা
  const handleBackFromOtp = () => {
    sessionStorage.removeItem('tempEmail');
    setTempEmail('');
    setShowOtpSection(false);
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&display=swap');`}</style>
      <style>{`
        :root {
          --primary: #6C63FF;
          --primary-light: rgba(108, 99, 255, 0.15);
          --bg: #f3f0ff;
          --glass-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%);
          --glass-border: rgba(255, 255, 255, 0.5);
          --glass-blur: blur(25px);
          --text-dark: #2d2d2d;
          --text-muted: #777777;
          --text-light: #aaaaaa;
          --border: #e8e5f5;
          --shadow-soft: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
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
        
        .register-container {
          position: relative; min-height: 100dvh; width: 100%; display: flex; flex-direction: column;
          padding: 20px 16px; padding-bottom: 50px; background: linear-gradient(135deg, #f3f0ff 0%, #e8e4ff 100%); overflow: hidden;
        }
        
        .floating-bubble { position: absolute; z-index: 0; pointer-events: none; filter: blur(8px); animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        .register-wrapper { width: 100%; max-width: 480px; margin: auto; display: flex; flex-direction: column; position: relative; z-index: 10; }
        .header-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; position: relative; }
        
        .back-btn {
          position: absolute; left: 0; top: 0; background: var(--glass-bg); backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 50%; width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          box-shadow: var(--shadow-soft); z-index: 10;
        }
        
        .logo-bg {
          width: 80px; height: 80px; background: var(--glass-bg); backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 50%;
          display: flex; justify-content: center; align-items: center; margin-bottom: 12px;
          overflow: hidden; box-shadow: var(--shadow-soft); position: relative;
        }
        .logo-bg img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; position: relative; z-index: 1;}
        
        .title { font-size: 24px; font-weight: 800; color: var(--text-dark); text-align: center; }
        .subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; font-weight: 500; text-align: center; }
        
        .form-card {
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border);
          border-radius: 24px; padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow-soft); position: relative; overflow: hidden;
        }
        
        .input-group {
          display: flex; align-items: center; background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(10px);
          border-radius: 14px; margin-bottom: 14px; padding: 0 15px; border: 1px solid rgba(255, 255, 255, 0.6); 
          transition: all 0.3s ease; position: relative; z-index: 1; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        .input-group:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); background: rgba(255, 255, 255, 0.5); }
        
        .input-icon { margin-right: 10px; flex-shrink: 0; display: flex; align-items: center; }
        .input-field { flex: 1; padding: 15px 0; font-size: 16px; color: var(--text-dark); background: transparent; border: none; outline: none; }
        .input-field::placeholder { color: var(--text-light); }
        
        .phone-prefix { display: flex; align-items: center; font-size: 15px; font-weight: 600; color: #25D366; padding-right: 8px; border-right: 1px solid rgba(0,0,0,0.1); margin-right: 8px; white-space: nowrap; }
        .password-toggle { background: none; border: none; cursor: pointer; padding: 5px; display: flex; align-items: center; color: #666; }
        
        .captcha-card {
          background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 16px; padding: 14px; margin-bottom: 20px; position: relative; z-index: 1; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        .captcha-label { font-size: 12px; color: var(--text-muted); font-weight: 700; margin-bottom: 10px; }
        .captcha-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .captcha-question-bg { background: rgba(108, 99, 255, 0.15); padding: 10px 16px; border-radius: 10px; flex-shrink: 0; }
        .captcha-question-text { font-size: 17px; font-weight: 800; color: var(--primary); letter-spacing: 2px; }
        .captcha-input {
          flex: 1; border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 10px; padding: 12px 15px; font-size: 16px;
          text-align: center; background-color: rgba(255, 255, 255, 0.6); outline: none; min-width: 0; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
        }
        .captcha-input:focus { border-color: var(--primary); background-color: #fff; }
        .refresh-btn { padding: 10px; background-color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.8); border-radius: 10px; cursor: pointer; flex-shrink: 0; }
        
        .submit-btn {
          display: flex; align-items: center; justify-content: center; width: 100%; background-color: var(--primary);
          padding: 16px; border: none; border-radius: 16px; cursor: pointer; box-shadow: var(--shadow-accent);
          transition: all 0.2s ease; position: relative; z-index: 1;
        }
        .submit-btn:active { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .submit-btn-text { color: #fff; font-size: 16px; font-weight: bold; }
        
        .spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .otp-section { background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); border-radius: 24px; padding: 25px 20px; box-shadow: var(--shadow-soft); }
        .otp-title { font-size: 20px; font-weight: 800; text-align: center; margin-bottom: 8px; }
        .otp-subtitle { font-size: 13px; color: var(--text-muted); text-align: center; margin-bottom: 20px; }
        
        .otp-input-group { display: flex; align-items: center; background: rgba(255,255,255,0.3); backdrop-filter: blur(10px); border-radius: 14px; margin-bottom: 20px; padding: 0 15px; border: 1px solid rgba(255,255,255,0.6); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); }
        .otp-input { flex: 1; padding: 15px 0; font-size: 22px; letter-spacing: 10px; text-align: center; color: var(--text-dark); background: transparent; border: none; outline: none; }
        .otp-input::placeholder { color: var(--text-light); letter-spacing: 10px; }

        /* Wheel Picker */
        .wheel-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .wheel-container { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.8); border-radius: 24px; width: 90%; max-width: 360px; padding: 0 0 12px 0; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
        .wheel-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .wheel-cancel, .wheel-done { background: none; border: none; font-size: 15px; font-weight: 700; cursor: pointer; color: var(--primary); }
        .wheel-title { font-size: 16px; font-weight: 800; color: var(--text-dark); }
        .wheel-search { display: flex; align-items: center; margin: 12px 20px; padding: 10px 15px; background-color: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; gap: 8px; }
        .wheel-search input { flex: 1; border: none; background: transparent; outline: none; font-size: 15px; color: var(--text-dark); }
        .wheel-body { position: relative; height: 240px; overflow: hidden; }
        .wheel-highlight { position: absolute; top: 50%; left: 5%; right: 5%; transform: translateY(-50%); height: 48px; background-color: rgba(108,99,255,0.1); border-top: 1px solid rgba(108,99,255,0.2); border-bottom: 1px solid rgba(108,99,255,0.2); border-radius: 12px; pointer-events: none; z-index: 1; }
        .wheel-list { height: 100%; overflow-y: auto; scrollbar-width: none; position: relative; z-index: 2; padding-top: 96px; padding-bottom: 96px; }
        .wheel-list::-webkit-scrollbar { display: none; }
        .wheel-item { height: 48px; display: flex; align-items: center; justify-content: center; font-size: 17px; color: var(--text-muted); cursor: pointer; transition: all 0.2s ease; }
        .wheel-item-selected { color: var(--primary); font-weight: 800; font-size: 18px; transform: scale(1.05); }
        .wheel-no-result { text-align: center; color: #999; padding: 20px 0; }
        .district-display { flex: 1; padding: 15px 0; font-size: 16px; color: var(--text-dark); cursor: pointer; background: transparent; border: none; outline: none; text-align: left; }
        .district-display.placeholder { color: var(--text-light); }
      `}</style>

      <div className="register-container">
        <div className="floating-bubble" style={{ width: 150, height: 150, borderRadius: '50%', background: 'rgba(108, 99, 255, 0.25)', top: -30, left: -30 }} />
        <div className="floating-bubble" style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255, 107, 107, 0.2)', top: 150, right: -40 }} />
        <div className="floating-bubble" style={{ width: 180, height: 180, borderRadius: '50%', background: 'rgba(78, 205, 196, 0.2)', bottom: -60, left: -50 }} />

        <div className="register-wrapper">
          <div className="header-container">
            <button type="button" className="back-btn" onClick={() => showOtpSection ? handleBackFromOtp() : navigate(-1)} aria-label="পিছনে যান">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div className="logo-bg"><img src="/logo.jpeg" alt="Logo" /></div>
            <h1 className="title">Ekotaboddho B.P</h1>
            <p className="subtitle">নতুন সদস্য নিবন্ধন ফর্ম</p>
          </div>

          {!showOtpSection ? (
            <>
              <div className="form-card">
                <div className="input-group">
                  <span className="input-icon"><FiUser size={20} color="#888" /></span>
                  <input type="text" className="input-field" placeholder="আপনার পুরো নাম" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="input-group">
                  <span className="input-icon"><FiMail size={20} color="#888" /></span>
                  <input type="email" className="input-field" placeholder="আপনার ইমেইল" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="input-group">
                  <span className="input-icon"><MdWhatsapp size={20} color="#25D366" /></span>
                  <span className="phone-prefix">+880</span>
                  <input type="tel" className="input-field" placeholder="1XXXXXXXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })} maxLength={10} />
                </div>
                <div className="input-group">
                  <span className="input-icon"><FiUser size={20} color="#888" /></span>
                  <input type="text" className="input-field" placeholder="পিতার নাম" value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} />
                </div>
                <div className="input-group" onClick={() => setShowWheel(true)}>
                  <span className="input-icon"><FiMapPin size={20} color="#888" /></span>
                  <button type="button" className={`district-display ${!formData.area ? 'placeholder' : ''}`}>
                    {formData.area || 'আপনার এলাকা নির্বাচন করুন'}
                  </button>
                </div>
                {formData.area === 'অন্যান্য' && (
                  <div className="input-group">
                    <span className="input-icon"><FiMapPin size={20} color="#888" /></span>
                    <input type="text" className="input-field" placeholder="আপনার এলাকার নাম লিখুন" value={formData.customArea} onChange={(e) => setFormData({ ...formData, customArea: e.target.value })} />
                  </div>
                )}
                <div className="input-group">
                  <span className="input-icon"><FiHome size={20} color="#888" /></span>
                  <input type="text" className="input-field" placeholder="আপনার বাড়ীর নাম" value={formData.houseName} onChange={(e) => setFormData({ ...formData, houseName: e.target.value })} />
                </div>
                <div className="input-group">
                  <span className="input-icon"><FiLock size={20} color="#888" /></span>
                  <input type={showPassword ? 'text' : 'password'} className="input-field" placeholder="পাসওয়ার্ড তৈরি করুন" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                <div className="input-group">
                  <span className="input-icon"><FiLock size={20} color="#888" /></span>
                  <input type={showConfirmPassword ? 'text' : 'password'} className="input-field" placeholder="পাসওয়ার্ড আবার লিখুন" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="captcha-card">
                <p className="captcha-label">নিরাপত্তা যাচাই: আপনি মানুষ তো?</p>
                <div className="captcha-row">
                  <div className="captcha-question-bg"><span className="captcha-question-text">{captcha.num1} + {captcha.num2} = ?</span></div>
                  <input type="number" className="captcha-input" placeholder="যোগফল লিখুন" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} />
                  <button type="button" className="refresh-btn" onClick={generateCaptcha}><FiRefreshCw size={20} color="#6C63FF" /></button>
                </div>
              </div>

              <button type="button" className="submit-btn" onClick={handleRegister} disabled={isLoading}>
                {isLoading ? <span className="spinner" /> : (<><span className="submit-btn-text">নিবন্ধন করুন</span><FiArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} /></>)}
              </button>
            </>
          ) : (
            <div className="otp-section">
              <h2 className="otp-title">ইমেইল OTP যাচাই করুন</h2>
              <p className="otp-subtitle">আপনার ইমেইলে পাঠানো ৬ সংখ্যার কোডটি লিখুন <br/>({tempEmail})</p>
              <div className="otp-input-group">
                <span className="input-icon"><FiMail size={20} color="#888" /></span>
                <input type="text" className="otp-input" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} />
              </div>
              <button type="button" className="submit-btn" onClick={handleOtpVerify} disabled={otpLoading}>
                {otpLoading ? <span className="spinner" /> : 'যাচাই করুন'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showWheel && (
        <WheelPicker items={areas} selectedValue={formData.area} onSelect={(value) => setFormData({ ...formData, area: value })} onClose={() => setShowWheel(false)} />
      )}
    </>
  );
}