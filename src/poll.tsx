// poll.tsx – Ekotaboddho B.P Poll & Voting Screen (Liquid Glass & Bug Fixed)
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUser, FaCalendarCheck, FaVoteYea, FaArrowLeft, FaHome } from 'react-icons/fa';
import { MdPoll } from 'react-icons/md';
import { HiOutlineRefresh } from 'react-icons/hi';
import { showToast } from './toast';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <div className="fade-in-view" style={{ animationDelay: `${delay}ms` }}>{children}</div>
);

export default function PollScreen() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/poll/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.polls)) {
        setPolls(data.polls);
        
        // ✅ ভোট স্টেট সিঙ্ক করা
        const userId = JSON.parse(localStorage.getItem('user') || '{}')?._id;
        const newVotedMap: Record<string, boolean> = {};
        data.polls.forEach((p: any) => {
          if (Array.isArray(p.voters) && userId && p.voters.some((v: any) => 
            (typeof v === 'string' ? v : v?.toString?.()) === userId
          )) {
            newVotedMap[p._id] = true;
          }
        });
        setVotedMap(prev => ({ ...prev, ...newVotedMap }));
      } else {
        setPolls([]);
      }
    } catch (err) {
      showToast('পোল লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/poll/vote/${pollId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ optionIndex }),
      });
      const data = await res.json();
      
      if (data.success) {
        setVotedMap(prev => ({ ...prev, [pollId]: true }));
        showToast('আপনার ভোট সফলভাবে গৃহীত হয়েছে!', 'success');
        fetchPolls(); 
      } else {
        showToast(data.message || 'ভোট দিতে সমস্যা হয়েছে', 'error');
      }
    } catch (err) {
      showToast('সার্ভার সমস্যা', 'error');
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
        
        .poll-container {
          position: relative;
          min-height: 100dvh; display: flex; flex-direction: column; align-items: center;
          padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
          background: linear-gradient(135deg, #f3f0ff 0%, #e8e4ff 100%);
          overflow: hidden;
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
        
        .poll-card {
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 24px; padding: 20px; margin-bottom: 15px;
          box-shadow: var(--shadow-main); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        
        .poll-question { font-size: 18px; font-weight: 800; margin-bottom: 15px; line-height: 1.4; color: #333; }
        
        .option-btn { 
          background: rgba(255,255,255,0.4); padding: 15px; border-radius: 16px; margin-bottom: 10px; 
          border: 1px solid var(--glass-border); cursor: pointer; width: 100%; text-align: left; 
          font-size: 15px; font-weight: 700; color: #444; transition: all 0.2s;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        }
        
        .option-btn:hover:not(:disabled) { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
        .option-btn:disabled { cursor: not-allowed; background: rgba(245,245,245,0.5); color: #888; border-color: rgba(0,0,0,0.05); }
        
        .vote-count { font-size: 13px; background: rgba(108, 99, 255, 0.15); color: var(--primary); padding: 4px 10px; border-radius: 12px; font-weight: 800; }
        
        .voted-badge { 
          text-align: center; color: #2ed573; font-weight: 800; margin-top: 15px; 
          background: rgba(46, 213, 115, 0.15); padding: 12px; border-radius: 14px; font-size: 14px;
          border: 1px solid rgba(46, 213, 115, 0.3);
        }
        
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

      <div className="poll-container">
        <div className="floating-bubble" style={{ width: 150, height: 150, borderRadius: '50%', background: 'rgba(108, 99, 255, 0.25)', top: -30, left: -30, animationDelay: '0s' }} />
        <div className="floating-bubble" style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255, 107, 107, 0.2)', top: 150, right: -40, animationDelay: '1s' }} />
        <div className="floating-bubble" style={{ width: 180, height: 180, borderRadius: '50%', background: 'rgba(78, 205, 196, 0.2)', bottom: -60, left: -50, animationDelay: '0.5s' }} />

        <div className="main-scroll">
          <div className="header-row">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              <FaArrowLeft size={18} />
            </button>
            <h1 className="header-title">ভোট / পোল</h1>
            <button className="refresh-btn" onClick={fetchPolls}>
              <HiOutlineRefresh size={20} />
            </button>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : polls.length === 0 ? (
            <div className="empty-state">
              <MdPoll size={60} color="#ccc" />
              <h3 style={{ marginTop: 15, fontSize: 18, color: '#666' }}>এখনো কোনো পোল নেই</h3>
              <p style={{ marginTop: 5, fontSize: 14 }}>অ্যাডমিন যখন নতুন পোল তৈরি করবেন, তা এখানে দেখা যাবে।</p>
            </div>
          ) : (
            polls.map((poll, idx) => {
              const hasVoted = votedMap[poll._id];
              return (
                <FadeInView key={poll._id} delay={idx * 100}>
                  <div className="poll-card">
                    <div className="poll-question">{poll.question}</div>
                    {poll.options.map((opt: any, i: number) => (
                      <button 
                        key={i} 
                        className="option-btn" 
                        onClick={() => handleVote(poll._id, i)} 
                        disabled={hasVoted}
                      >
                        <span>{opt.text}</span>
                        <span className="vote-count">{opt.votes || 0} ভোট</span>
                      </button>
                    ))}
                    {hasVoted && (
                      <div className="voted-badge">
                        ✓ আপনি এই পোলে ভোট দিয়েছেন
                      </div>
                    )}
                  </div>
                </FadeInView>
              );
            })
          )}
        </div>

        <div className="bottom-nav-container">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <div className="nav-icon-circle"><FaHome size={22} color="#666" /></div>
            <span className="nav-text">হোম</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/poll')}>
            <div className="nav-icon-circle" style={{ background: 'var(--primary-light)' }}><FaVoteYea size={20} color="var(--primary)" /></div>
            <span className="nav-text-active">পোল</span>
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
