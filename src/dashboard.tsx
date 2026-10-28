// dashboard.tsx – Ekotaboddho B.P Advanced User Dashboard (Liquid Glass)
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCoins, FaBullhorn, FaBell, FaEye, FaUsers, FaUser, 
  FaVoteYea, FaHome, FaCalendarCheck,
  FaSignOutAlt, FaInfoCircle
} from 'react-icons/fa';
import {
  IoWaterOutline, IoCallOutline, IoLocationOutline, IoClose,
  IoStarOutline, IoPersonOutline, IoShieldCheckmark, IoBusinessOutline,
  IoHourglassOutline
} from 'react-icons/io5';
import { MdPoll, MdDashboard } from 'react-icons/md';
import { HiOutlineRefresh } from 'react-icons/hi';
import { showToast } from './toast';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const FloatingElement: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`floating-element ${className}`}>{children}</div>
);
const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <div className="fade-in-view" style={{ animationDelay: `${delay}ms` }}>{children}</div>
);

export default function Dashboard() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false); // ✅ নতুন স্টেট
  const [members, setMembers] = useState<any[]>([]);
  const [fund, setFund] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activePoll, setActivePoll] = useState<any>(null);
  const [voted, setVoted] = useState(false);
  const [latestNotice, setLatestNotice] = useState<any>(null);
  const [noticePopup, setNoticePopup] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [spotlightMember, setSpotlightMember] = useState<any>(null);
  
  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [superAdminVisible, setSuperAdminVisible] = useState(false);
  const [superPassword, setSuperPassword] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rulesCheckbox, setRulesCheckbox] = useState(false); // চেকবক্সের জন্য
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [memRes, fundRes, pollRes, noticeRes, eventRes] = await Promise.all([
        fetch(`${API_URL}/users/approved`, { headers }),
        fetch(`${API_URL}/fund`, { headers }),
        fetch(`${API_URL}/poll/active`, { headers }),
        fetch(`${API_URL}/notices/latest`, { headers }),
        fetch(`${API_URL}/events/upcoming`, { headers }).catch(() => null),
      ]);

      let memData: any = null, fundData: any = null, pollData: any = null,
          noticeData: any = null, eventData: any = null;
      try { memData = await memRes.json(); } catch (e) {}
      try { fundData = await fundRes.json(); } catch (e) {}
      try { pollData = await pollRes.json(); } catch (e) {}
      try { noticeData = await noticeRes.json(); } catch (e) {}
      if (eventRes) { try { eventData = await eventRes.json(); } catch (e) {} }

      if (memData?.success) {
        setMembers(memData.users || []);
        const all = memData.users || [];
        setSpotlightMember(all.length > 0 ? all[Math.floor(Math.random() * all.length)] : null);
      }
      if (fundData?.totalAmount !== undefined) setFund(fundData.totalAmount || 0);
      
      if (pollData?.success && Array.isArray(pollData.polls) && pollData.polls.length > 0) {
        setActivePoll(pollData.polls[0]);
      } else {
        setActivePoll(null);
      }
      
      if (noticeData?.success && noticeData.notice) {
        setLatestNotice(noticeData.notice);
        if (!sessionStorage.getItem('noticeShown')) {
          setNoticePopup(true);
          sessionStorage.setItem('noticeShown', 'true');
        }
      } else {
        setLatestNotice(null);
        setNoticePopup(false);
      }
      
      if (eventData?.success && Array.isArray(eventData.events)) {
        setUpcomingEvents(eventData.events.slice(0, 4));
      } else {
        setUpcomingEvents([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      setIsAdmin(user.role === 'admin' || user.isAdmin === true);
      setIsApproved(user.approved === true);
      setRulesAccepted(user.rulesAccepted === true); // ✅ নতুন
    }
  }, []);

  useEffect(() => {
    if (isApproved) {
      fetchAllData();
    } else if (!rulesAccepted) {
      // ✅ ইউজার অ্যাপ্রুভড না হলে এবং রুলস অ্যাকসেপ্ট না করলে মডাল দেখাবে
      setShowRulesModal(true);
    }
  }, [isApproved, rulesAccepted, fetchAllData]);

  const handleRefresh = () => {
    if (isApproved) {
      fetchAllData();
      showToast('ড্যাশবোর্ড আপডেট হয়েছে', 'success');
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (!activePoll) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/poll/vote/${activePoll._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ optionIndex }),
      });
      const data = await res.json();
      if (data.success) {
        setVoted(true);
        showToast('আপনার ভোট গৃহীত হয়েছে!', 'success');
        fetchAllData();
      } else {
        showToast(data.message || 'ইতিমধ্যে ভোট দিয়েছেন!', 'error');
      }
    } catch (err) {
      showToast('সার্ভার সমস্যা', 'error');
    }
  };

  const handleAcceptRules = async () => {
    if (!rulesCheckbox) return;
    setIsSubmittingApproval(true);
    try {
      const token = localStorage.getItem('token');
      // ✅ নতুন এপিআই কল
      const res = await fetch(`${API_URL}/users/accept-rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('নিয়মাবলী গ্রহণ করা হয়েছে! অ্যাডমিনের অনুমোদনের অপেক্ষা করুন।', 'success');
        setShowRulesModal(false);
        setRulesAccepted(true); // লোকাল স্টেট আপডেট
        
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.rulesAccepted = true;
        localStorage.setItem('user', JSON.stringify(storedUser));
      } else {
        showToast(data.message || 'সমস্যা হয়েছে', 'error');
      }
    } catch (err) {
      showToast('সার্ভার সমস্যা', 'error');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleSuperAdminLogin = () => {
    if (superPassword === '186401') {
      localStorage.setItem('superAdminVerified', 'true');
      setSuperAdminVisible(false);
      setSuperPassword('');
      navigate('/superadmin');
    } else {
      showToast('Access Denied - Incorrect Password!', 'error');
    }
  };

  const handleLogout = () => {
    if (window.confirm('আপনি কি লগআউট করতে চান?')) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/', { replace: true });
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
        
        .dashboard-container {
          position: relative;
          min-height: 100dvh; display: flex; flex-direction: column; align-items: center;
          padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
          background: linear-gradient(135deg, #f3f0ff 0%, #e8e4ff 100%);
          overflow: hidden;
        }
        
        .floating-bubble {
          position: absolute; z-index: 0; pointer-events: none; filter: blur(8px);
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        .main-scroll { width: 100%; max-width: 600px; padding: 0 15px; position: relative; z-index: 10; }
        
        .header-container {
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 24px; padding: 15px;
          margin: 15px 0; box-shadow: var(--shadow-main);
        }
        .header-top-row { display: flex; justify-content: space-between; align-items: center; }
        .greeting-text { font-size: 13px; color: var(--primary); font-weight: 700; }
        .header-title { font-size: 22px; font-weight: 800; margin-top: 2px; }
        
        .header-icon-container {
          width: 50px; height: 50px; background: rgba(255,255,255,0.4);
          backdrop-filter: blur(10px); border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: 1px solid var(--glass-border); overflow: hidden; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        .header-icon-container img { width: 100%; height: 100%; object-fit: cover; }
        
        .admin-btn {
          display: inline-flex; align-items: center; background: rgba(51, 51, 51, 0.9); color: #fff;
          padding: 6px 12px; border-radius: 30px; margin-top: 10px;
          font-size: 11px; font-weight: 600; cursor: pointer; border: none; gap: 5px;
        }

        .quick-actions-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 15px;
        }
        .action-card {
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 18px; padding: 15px 10px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer;
          box-shadow: var(--shadow-main); transition: all 0.2s; text-align: center;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        .action-card:active { transform: scale(0.96); }
        .action-icon {
          width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.6);
        }
        .action-text { font-size: 13px; font-weight: 700; color: var(--text-dark); }

        .clean-card {
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 20px; padding: 15px; margin-bottom: 15px;
          box-shadow: var(--shadow-main); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        .section-title { font-size: 18px; font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;}
        
        .slider-container { display: flex; overflow-x: auto; gap: 12px; padding: 5px 0 15px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .slider-container::-webkit-scrollbar { display: none; }
        .slide-box {
          min-width: 80%; height: 120px; background: var(--glass-bg);
          backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 20px; padding: 15px;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: var(--shadow-main); flex-shrink: 0; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        .slide-sub-text { font-size: 11px; color: var(--primary); font-weight: 700; }
        .slide-text { font-size: 18px; font-weight: bold; margin-top: 4px; }
        .slide-time { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

        .fund-amount { font-size: 28px; font-weight: 800; color: var(--primary); margin-top: 4px; }
        .fund-icon-bg { width: 50px; height: 50px; background: rgba(255,255,255,0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        
        .profile-avatar-small { width: 45px; height: 45px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: #fff; }
        .profile-row { display: flex; align-items: center; justify-content: space-between; }
        .profile-name { font-size: 16px; font-weight: 700; }
        .profile-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; display: flex; align-items: center; gap: 4px;}
        
        .notice-card-title { font-size: 16px; font-weight: bold; display: flex; align-items: center; gap: 8px; }
        .notice-card-desc { font-size: 13px; color: #444; line-height: 20px; margin-top: 6px; }
        
        .poll-question { font-size: 16px; font-weight: bold; margin-bottom: 12px; }
        .option-btn { background: rgba(255,255,255,0.4); padding: 12px; border-radius: 12px; margin-bottom: 8px; border: 1px solid var(--glass-border); cursor: pointer; width: 100%; text-align: left; font-size: 15px; color: #333; transition: all 0.2s;}
        .option-btn:hover { background: var(--primary-light); }
        .option-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .voted-text { text-align: center; color: #2ed573; font-weight: 600; margin-top: 10px; }

        .link-text { color: var(--primary); font-weight: 700; background: none; border: none; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 4px; }

        .bottom-nav-container { 
          position: fixed; bottom: 0; left: 0; right: 0; height: calc(70px + env(safe-area-inset-bottom, 0px));
          padding-bottom: env(safe-area-inset-bottom, 0px); backdrop-filter: blur(25px); background: rgba(255,255,255,0.7);
          border-top: 1px solid var(--glass-border); display: flex; justify-content: space-around; align-items: center; z-index: 900; 
        }
        .nav-item { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 25%; background: none; border: none; cursor: pointer; }
        .nav-icon-circle { width: 40px; height: 40px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; margin-bottom: 2px; transition: background 0.3s;}
        .nav-text { font-size: 11px; color: #666; font-weight: 600; }
        .nav-text-active { color: var(--primary); font-weight: 800; }
        
        .footer-text { color: #999; text-align: center; font-size: 11px; margin: 20px 0 10px; cursor: pointer; user-select: none; }
        
        .floating-element { animation: float 3s ease-in-out infinite; }
        .fade-in-view { opacity: 0; animation: fadeInUp 0.6s forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spinner { width: 24px; height: 24px; border: 3px solid rgba(0,0,0,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 20px auto; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 15px;}
        .modal-content { background: rgba(255,255,255,0.85); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.8); width: 100%; max-width: 420px; padding: 25px; border-radius: 24px; animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); max-height: 85vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.1);}
        @keyframes modalPop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        .close-icon-bg { padding: 8px; background: #f0f0f0; border: none; border-radius: 50%; cursor: pointer; }
        .modal-image-bg { width: 80px; height: 80px; background: var(--primary-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 32px; font-weight: bold; color: var(--primary); }
        .modal-title { font-size: 22px; font-weight: 800; text-align: center; }
        .modal-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 4px; text-align: center; margin-bottom: 20px;}
        .info-row { display: flex; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(0,0,0,0.05); gap: 12px; }
        .modal-text { color: #333; font-size: 15px; font-weight: 500; }
        
        .super-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); display: flex; justify-content: center; align-items: center; z-index: 1100; }
        .super-admin-modal { width: 85%; max-width: 400px; background: #1a1a1a; padding: 30px; border-radius: 24px; border: 1px solid #ff4757; display: flex; flex-direction: column; align-items: center; box-shadow: 0 0 30px rgba(255,71,87,0.2);}
        .super-title { color: #ff4757; font-size: 18px; font-weight: 900; letter-spacing: 2px; margin-bottom: 25px; }
        .super-input { width: 100%; background: #000; color: #2ed573; border: 1px solid #333; border-radius: 12px; padding: 15px; text-align: center; margin-bottom: 20px; outline: none; font-size: 18px; letter-spacing: 5px;}
        .super-btn { background: #ff4757; color: #fff; font-weight: bold; padding: 14px; width: 100%; border: none; border-radius: 12px; cursor: pointer; }
        .super-cancel { background: none; border: none; color: #888; margin-top: 15px; cursor: pointer; }
        
        .notice-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1050; padding: 15px;}
        .notice-popup { background: rgba(255,255,255,0.95); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.8); width: 100%; max-width: 400px; border-radius: 28px; padding: 30px 25px; text-align: center; box-shadow: 0 15px 50px rgba(0,0,0,0.15);}
        .notice-title { font-size: 22px; font-weight: 800; margin-bottom: 12px; }
        .notice-desc { font-size: 15px; color: #444; line-height: 1.6; margin-bottom: 25px; }
        .notice-close-btn { background: #ff4757; color: #fff; padding: 14px 30px; border: none; border-radius: 25px; cursor: pointer; font-weight: bold; width: 100%; font-size: 16px;}
        
        .rules-list { margin: 20px 0; padding-left: 25px; font-size: 15px; line-height: 1.8; color: #333;}
        .rules-list li { margin-bottom: 8px; }
        .checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; margin: 20px 0; font-size: 15px; font-weight: 600; color: #333;}
        .checkbox-label input { width: 20px; height: 20px; accent-color: var(--primary); }
      `}</style>

      <div className="dashboard-container">
        <div className="floating-bubble" style={{ width: 150, height: 150, borderRadius: '50%', background: 'rgba(108, 99, 255, 0.25)', top: -30, left: -30, animationDelay: '0s' }} />
        <div className="floating-bubble" style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255, 107, 107, 0.2)', top: 150, right: -40, animationDelay: '1s' }} />
        <div className="floating-bubble" style={{ width: 180, height: 180, borderRadius: '50%', background: 'rgba(78, 205, 196, 0.2)', bottom: -60, left: -50, animationDelay: '0.5s' }} />

        <div className="main-scroll">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button onClick={handleRefresh} style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)', boxShadow: 'var(--shadow-main)', backdropFilter: 'blur(10px)' }} aria-label="রিফ্রেশ">
              <HiOutlineRefresh size={22} />
            </button>
          </div>

          <FadeInView>
            <div className="header-container">
              <div className="header-top-row">
                <div>
                  <p className="greeting-text">Ekotaboddho B.P</p>
                  <h1 className="header-title">{userData?.name ? `স্বাগতম, ${userData.name.split(' ')[0]}` : 'ড্যাশবোর্ড'}</h1>
                </div>
                <button className="header-icon-container" onClick={() => navigate('/profile')}>
                  <FloatingElement>
                    <img src="/logo.jpeg" alt="logo" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                  </FloatingElement>
                </button>
              </div>
              {isAdmin && (
                <button className="admin-btn" onClick={() => navigate('/superadmin')}>
                  <IoShieldCheckmark size={16} color="#fff" /> অ্যাডমিন প্যানেল
                </button>
              )}
            </div>
          </FadeInView>

          {isApproved ? (
            <>
              {userData && (
                <FadeInView delay={100}>
                  <div className="clean-card">
                    <div className="profile-row">
                      <div className="profile-info" style={{display: 'flex', alignItems: 'center', gap: 12}}>
                        <div className="profile-avatar-small">{userData.name?.charAt(0) || 'U'}</div>
                        <div>
                          <div className="profile-name">{userData.name}</div>
                          <div className="profile-sub">{userData.memberId || 'ID: Pending'} • {userData.phone}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 15, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, background: 'var(--primary-light)', padding: '6px 12px', borderRadius: 20, color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IoLocationOutline size={14}/> {userData.area || userData.district || 'N/A'}
                      </span>
                      {userData.houseName && (
                        <span style={{ fontSize: 12, background: 'rgba(255, 71, 87, 0.1)', padding: '6px 12px', borderRadius: 20, color: '#ff4757', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <IoBusinessOutline size={14}/> {userData.houseName}
                        </span>
                      )}
                    </div>
                  </div>
                </FadeInView>
              )}

              <FadeInView delay={200}>
                <div className="quick-actions-grid">
                  <div className="action-card" onClick={() => navigate('/members')}>
                    <div className="action-icon"><FaUsers size={22} color="#6C63FF" /></div>
                    <div className="action-text">মেম্বার</div>
                  </div>
                  <div className="action-card" onClick={() => navigate('/poll')}>
                    <div className="action-icon"><FaVoteYea size={22} color="#2ed573" /></div>
                    <div className="action-text">পোল</div>
                  </div>
                  <div className="action-card" onClick={() => navigate('/notices')}>
                    <div className="action-icon"><FaBullhorn size={22} color="#ff4757" /></div>
                    <div className="action-text">নোটিশ</div>
                  </div>
                  <div className="action-card" onClick={() => navigate('/events')}>
                    <div className="action-icon"><FaCalendarCheck size={22} color="#ffa502" /></div>
                    <div className="action-text">ইভেন্ট</div>
                  </div>
                  <div className="action-card" onClick={() => navigate('/profile')}>
                    <div className="action-icon"><FaUser size={22} color="#00adb5" /></div>
                    <div className="action-text">প্রোফাইল</div>
                  </div>
                  <div className="action-card" onClick={() => setShowRulesModal(true)}>
                    <div className="action-icon"><FaInfoCircle size={22} color="#9b59b6" /></div>
                    <div className="action-text">নিয়মাবলী</div>
                  </div>
                  <div className="action-card" onClick={() => showToast(`বর্তমান ক্লাব ফান্ড: ৳ ${fund}`, 'info')}>
                    <div className="action-icon"><FaCoins size={22} color="#f1c40f" /></div>
                    <div className="action-text">ক্লাব ফান্ড</div>
                  </div>
                  <div className="action-card" onClick={handleLogout}>
                    <div className="action-icon"><FaSignOutAlt size={22} color="#e74c3c" /></div>
                    <div className="action-text">লগআউট</div>
                  </div>
                </div>
              </FadeInView>

              {upcomingEvents.length > 0 && (
                <FadeInView delay={300}>
                  <div className="slider-container">
                    {upcomingEvents.map((event: any, idx: number) => (
                      <div key={idx} className="slide-box">
                        <div>
                          <span className="slide-sub-text">আসন্ন ইভেন্ট</span>
                          <div className="slide-text">{event.title}</div>
                          <div className="slide-time">{event.date ? new Date(event.date).toLocaleDateString('bn-BD') : 'তারিখ নির্ধারিত হয়নি'}</div>
                        </div>
                        <FloatingElement><MdDashboard size={36} color="rgba(108,99,255,0.3)" /></FloatingElement>
                      </div>
                    ))}
                  </div>
                </FadeInView>
              )}

              <FadeInView delay={400}>
                <div className="clean-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>ক্লাব ফান্ড</span>
                      <div className="fund-amount">৳ {fund}</div>
                    </div>
                    <FloatingElement className="fund-icon-bg"><FaCoins size={28} color="#6C63FF" /></FloatingElement>
                  </div>
                </div>
              </FadeInView>

              {latestNotice && (
                <FadeInView delay={500}>
                  <div className="clean-card" style={{ borderLeft: '4px solid #ff4757' }}>
                    <div className="notice-card-title"><FaBell size={20} color="#ff4757" /> {latestNotice.title}</div>
                    <p className="notice-card-desc">{latestNotice.description.substring(0, 80)}...</p>
                    <button className="link-text" style={{ marginTop: 12, color: '#ff4757' }} onClick={() => navigate('/notices')}>সব নোটিশ দেখুন →</button>
                  </div>
                </FadeInView>
              )}

              <FadeInView delay={600}>
                <div className="clean-card">
                  <div className="section-title"><MdPoll size={22} color="var(--primary)"/> চলমান পোল</div>
                  {activePoll ? (
                    <>
                      <div className="poll-question">{activePoll.question}</div>
                      {activePoll.options.map((opt: any, idx: number) => (
                        <button key={idx} className="option-btn" onClick={() => handleVote(idx)} disabled={voted}>
                          {opt.text} ({opt.votes || 0} ভোট)
                        </button>
                      ))}
                      {voted && <div className="voted-text">✓ ভোট সম্পন্ন হয়েছে</div>}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}><p style={{ color: '#888' }}>এখনো কোনো পোল নেই</p></div>
                  )}
                </div>
              </FadeInView>

              <FadeInView delay={700}>
                <div className="clean-card">
                  {spotlightMember ? (
                    <>
                      <div className="section-title">আজকের মেম্বার স্পটলাইট</div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="profile-avatar-small" style={{ width: 50, height: 50 }}>{spotlightMember.name.charAt(0)}</div>
                        <div style={{ marginLeft: 12, flex: 1 }}>
                          <div className="profile-name">{spotlightMember.name}</div>
                          <div className="profile-sub">{spotlightMember.area || 'N/A'}</div>
                        </div>
                      </div>
                      <button className="link-text" style={{ marginTop: 12 }} onClick={() => { setSelectedMember(spotlightMember); setModalVisible(true); }}>বিস্তারিত দেখুন →</button>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center' }}><IoStarOutline size={30} color="#ccc" /><p style={{ color: '#888', marginTop: 8 }}>কোনো মেম্বার নেই</p></div>
                  )}
                </div>
              </FadeInView>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#888', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', borderRadius: 24, marginTop: 20, border: '1px solid var(--glass-border)' }}>
              <IoHourglassOutline size={50} color="#6C63FF" style={{ marginBottom: 15 }}/>
              <h3 style={{ fontSize: 20, color: 'var(--text-dark)', marginBottom: 8 }}>অনুমোদনের অপেক্ষায়...</h3>
              <p style={{ fontSize: 15 }}>
                {rulesAccepted 
                  ? 'আপনি রুলস অ্যাকসেপ্ট করেছেন। অ্যাডমিন আপনার অ্যাকাউন্ট অ্যাপ্রুভ করলেই সব ফিচার আনলক হবে।' 
                  : 'অনুগ্রহ করে রুলস মডালে সম্মতি দিন।'}
              </p>
            </div>
          )}

          <div className="footer-text" onDoubleClick={() => setSuperAdminVisible(true)} title="সুপার অ্যাডমিন (ডাবল ক্লিক)">
            Ekotaboddho B.P v1.0.7
          </div>
        </div>

        <div className="bottom-nav-container">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <div className="nav-icon-circle" style={{ background: 'var(--primary-light)' }}><FaHome size={22} color="#6C63FF" /></div>
            <span className="nav-text-active">হোম</span>
          </button>
          
          <button className="nav-item" onClick={() => navigate('/poll')}>
            <div className="nav-icon-circle"><MdPoll size={24} color="#666" /></div>
            <span className="nav-text">পোল</span>
          </button>

          <button className="nav-item" onClick={() => navigate('/events')}>
            <div className="nav-icon-circle"><FaCalendarCheck size={22} color="#666" /></div>
            <span className="nav-text">ইভেন্ট</span>
          </button>

          <button className="nav-item" onClick={() => navigate('/profile')}>
            <div className="nav-icon-circle"><FaUser size={22} color="#666" /></div>
            <span className="nav-text">প্রোফাইল</span>
          </button>
        </div>
      </div>

      {modalVisible && selectedMember && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="close-icon-bg" onClick={() => setModalVisible(false)}><IoClose size={22} color="#333" /></button>
            </div>
            <div className="modal-image-bg">{selectedMember.name.charAt(0)}</div>
            <h2 className="modal-title">{selectedMember.name}</h2>
            <p className="modal-subtitle">ID: {selectedMember.memberId || 'N/A'}</p>
            <div className="info-row"><IoWaterOutline size={20} color="#ff4757" /><span className="modal-text">রক্তের গ্রুপ: {selectedMember.bloodGroup || 'N/A'}</span></div>
            <div className="info-row"><IoCallOutline size={20} color="#6C63FF" /><span className="modal-text">ফোন: {selectedMember.phone || 'N/A'}</span></div>
            <div className="info-row"><IoLocationOutline size={20} color="#6C63FF" /><span className="modal-text">এলাকা: {selectedMember.area || selectedMember.district || 'N/A'}</span></div>
            {selectedMember.houseName && <div className="info-row"><IoBusinessOutline size={20} color="#ffa502" /><span className="modal-text">বাড়ি: {selectedMember.houseName}</span></div>}
          </div>
        </div>
      )}

      {superAdminVisible && (
        <div className="super-overlay">
          <div className="super-admin-modal">
            <div className="super-title">ROOT ACCESS</div>
            <input type="password" className="super-input" placeholder="Password" value={superPassword} onChange={(e) => setSuperPassword(e.target.value)} />
            <button className="super-btn" onClick={handleSuperAdminLogin}>UNLOCK</button>
            <button className="super-cancel" onClick={() => setSuperAdminVisible(false)}>Cancel</button>
          </div>
        </div>
      )}

      {noticePopup && latestNotice && (
        <div className="notice-overlay" onClick={() => setNoticePopup(false)}>
          <div className="notice-popup" onClick={(e) => e.stopPropagation()}>
            <FaBullhorn size={45} color="#ff4757" style={{ marginBottom: 15 }} />
            <h2 className="notice-title">{latestNotice.title}</h2>
            <p className="notice-desc">{latestNotice.description}</p>
            <button className="notice-close-btn" onClick={() => setNoticePopup(false)}>বন্ধ করুন</button>
          </div>
        </div>
      )}

      {showRulesModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">গ্রুপের নিয়মাবলী</h2>
            <ul className="rules-list">
              <li>সদস্যদের সাথে সদয় ব্যবহার করুন।</li>
              <li>রাজনৈতিক বা ধর্মীয় বিতর্ক এড়িয়ে চলুন।</li>
              <li>স্প্যাম বা অপ্রাসঙ্গিক লিংক শেয়ার করবেন না।</li>
              <li>গ্রুপের সিদ্ধান্ত মেনে চলুন।</li>
            </ul>
            <label className="checkbox-label">
              <input type="checkbox" checked={rulesCheckbox} onChange={(e) => setRulesCheckbox(e.target.checked)} />
              আমি উপরোক্ত নিয়মাবলী মেনে চলতে সম্মত
            </label>
            <button
              onClick={handleAcceptRules}
              disabled={!rulesCheckbox || isSubmittingApproval}
              style={{ width: '100%', padding: 15, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontWeight: 700, fontSize: 16, opacity: (!rulesCheckbox || isSubmittingApproval) ? 0.6 : 1, boxShadow: 'var(--shadow-accent)' }}
            >
              {isSubmittingApproval ? 'পাঠানো হচ্ছে...' : 'সাবমিট করুন'}
            </button>
            {!isApproved && (
              <button onClick={() => setShowRulesModal(false)} style={{ width: '100%', padding: 12, background: 'none', color: '#888', border: 'none', cursor: 'pointer', marginTop: 10, fontWeight: 600 }}>
                পরে করব
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}