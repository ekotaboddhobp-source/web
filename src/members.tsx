// members.tsx – Ekotaboddho B.P Members List (Liquid Glass)
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUser, FaCalendarCheck, FaVoteYea, FaHome, FaArrowLeft, FaSearch, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { MdPoll, MdVerified } from 'react-icons/md';
import { HiOutlineRefresh } from 'react-icons/hi';
import { showToast } from './toast';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <div className="fade-in-view" style={{ animationDelay: `${delay}ms` }}>{children}</div>
);

export default function MembersScreen() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/approved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setMembers(data.users);
      } else {
        setMembers([]);
      }
    } catch (err) {
      showToast('মেম্বার লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ✅ সার্চ ফিল্টার লজিক (ক্র্যাশ-প্রুফ)
  const searchLower = searchTerm.toLowerCase().trim();
  const filteredMembers = members.filter(m => {
    const name = (m.name || '').toLowerCase();
    const memberId = (m.memberId || '').toLowerCase();
    const area = (m.area || m.district || '').toLowerCase();
    const phone = (m.phone || '').toLowerCase();
    
    return name.includes(searchLower) || 
           memberId.includes(searchLower) || 
           area.includes(searchLower) ||
           phone.includes(searchLower);
  });

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
          padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
          background: linear-gradient(135deg, #f3f0ff 0%, #e8e4ff 100%); overflow: hidden;
        }
        
        .floating-bubble { position: absolute; z-index: 0; pointer-events: none; filter: blur(8px); animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        .main-scroll { width: 100%; max-width: 600px; padding: 0 15px; position: relative; z-index: 10; }
        
        .header-row { display: flex; justify-content: space-between; align-items: center; margin: 20px 0 15px; }
        .back-btn, .refresh-btn { 
          background: rgba(255,255,255,0.4); border: 1px solid var(--glass-border); 
          width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
          cursor: pointer; color: var(--text-dark); backdrop-filter: blur(10px); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        .refresh-btn { color: var(--primary); }
        .header-title { font-size: 22px; font-weight: 800; }

        .search-box {
          display: flex; align-items: center; background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 14px; padding: 0 15px;
          margin-bottom: 20px; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        .search-icon { color: #888; margin-right: 10px; }
        .search-input { flex: 1; padding: 14px 0; font-size: 16px; color: var(--text-dark); background: transparent; border: none; outline: none; }
        
        .member-card {
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 20px; padding: 15px; margin-bottom: 12px;
          box-shadow: var(--shadow-main); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
          display: flex; align-items: center; gap: 15px;
        }
        .avatar { width: 55px; height: 55px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; flex-shrink: 0; box-shadow: 0 4px 10px rgba(108, 99, 255, 0.3);}
        .member-info { flex: 1; }
        .member-name { font-size: 17px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
        .member-id { font-size: 12px; color: var(--primary); font-weight: 700; background: var(--primary-light); padding: 2px 8px; border-radius: 10px; display: inline-block; margin-top: 4px; }
        .member-details { display: flex; gap: 12px; margin-top: 8px; font-size: 13px; color: #555; flex-wrap: wrap; }
        .detail-item { display: flex; align-items: center; gap: 4px; }

        .empty-state { text-align: center; padding: 50px 20px; color: #888; }
        .spinner { width: 30px; height: 30px; border: 4px solid rgba(108, 99, 255, 0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 40px auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .fade-in-view { opacity: 0; animation: fadeInUp 0.5s forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

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

      <div className="page-container">
        <div className="floating-bubble" style={{ width: 150, height: 150, borderRadius: '50%', background: 'rgba(108, 99, 255, 0.25)', top: -30, left: -30, animationDelay: '0s' }} />
        <div className="floating-bubble" style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255, 107, 107, 0.2)', top: 150, right: -40, animationDelay: '1s' }} />

        <div className="main-scroll">
          <div className="header-row">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              <FaArrowLeft size={18} />
            </button>
            <h1 className="header-title">সদস্য তালিকা</h1>
            <button className="refresh-btn" onClick={fetchMembers}>
              <HiOutlineRefresh size={20} />
            </button>
          </div>

          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="নাম, আইডি বা ফোন দিয়ে খুঁজুন..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="spinner" />
          ) : filteredMembers.length === 0 ? (
            <div className="empty-state">
              <FaUsers size={60} color="#ccc" />
              <h3 style={{ marginTop: 15, fontSize: 18, color: '#666' }}>
                {searchTerm ? 'কোনো সদস্য পাওয়া যায়নি' : 'এখনো কোনো সদস্য নেই'}
              </h3>
              <p style={{ marginTop: 5, fontSize: 14 }}>
                {searchTerm ? 'অনুসন্ধান পরিবর্তন করে আবার চেষ্টা করুন।' : 'অ্যাডমিন অ্যাপ্রুভ করলে সদস্যরা এখানে দেখা যাবে।'}
              </p>
            </div>
          ) : (
            filteredMembers.map((member, idx) => (
              <FadeInView key={member._id} delay={idx * 50}>
                <div className="member-card">
                  <div className="avatar">{member.name?.charAt(0) || 'U'}</div>
                  <div className="member-info">
                    <div className="member-name">
                      {member.name || 'নাম নেই'} <MdVerified size={16} color="#6C63FF" />
                    </div>
                    <div className="member-id">ID: {member.memberId || 'N/A'}</div>
                    <div className="member-details">
                      <div className="detail-item"><FaPhoneAlt size={12}/> {member.phone || 'N/A'}</div>
                      <div className="detail-item"><FaMapMarkerAlt size={12}/> {member.area || member.district || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </FadeInView>
            ))
          )}
        </div>

        <div className="bottom-nav-container">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <div className="nav-icon-circle"><FaHome size={22} color="#666" /></div>
            <span className="nav-text">হোম</span>
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
    </>
  );
}