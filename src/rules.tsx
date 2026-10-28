// rules.tsx – Ekotaboddho B.P Rules & Regulations (Liquid Glass)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaMoneyBillWave, FaHandsHelping, FaCalendarCheck, FaShieldAlt } from 'react-icons/fa';

export default function RulesScreen() {
  const navigate = useNavigate();

  const rulesData = [
    {
      icon: <FaUsers size={24} color="#6C63FF" />,
      title: '১. একতা ও শৃঙ্খলা',
      desc: 'সবাইকে একে অপরের প্রতি সম্মান প্রদর্শন করতে হবে এবং ক্লাবের শৃঙ্খলা বজায় রাখতে হবে।'
    },
    {
      icon: <FaMoneyBillWave size={24} color="#f0a500" />,
      title: '২. মাসিক চাঁদা',
      desc: 'প্রতি মাসের নির্দিষ্ট সময়ের মধ্যে ক্লাবের মাসিক ফান্ড/চাঁদা পরিশোধ করতে হবে।'
    },
    {
      icon: <FaCalendarCheck size={24} color="#2ed573" />,
      title: '৩. ইভেন্টে অংশগ্রহণ',
      desc: 'ক্লাবের যেকোনো সামাজিক বা সাংগঠনিক কাজে মেম্বারদের স্বতঃস্ফূর্ত অংশগ্রহণ কাম্য।'
    },
    {
      icon: <FaHandsHelping size={24} color="#ff4757" />,
      title: '৪. পারস্পরিক সহযোগিতা',
      desc: 'কোনো সদস্য বিপদে পড়লে বা অসুস্থ হলে সবাইকে এগিয়ে আসতে হবে।'
    },
    {
      icon: <FaShieldAlt size={24} color="#9b59b6" />,
      title: '৫. গোপনীয়তা রক্ষা',
      desc: 'ক্লাবের অভ্যন্তরীণ কোনো বিষয় বা আলোচনা বাইরে প্রকাশ করা যাবে না।'
    }
  ];

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

        .main-content { width: 100%; max-width: 600px; position: relative; z-index: 10; }
        .header-row { display: flex; align-items: center; margin-bottom: 25px; }
        .back-btn { background: rgba(255,255,255,0.4); border: 1px solid var(--glass-border); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-dark); backdrop-filter: blur(10px); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); }
        .header-title { font-size: 22px; font-weight: 800; margin-left: 15px; }

        .rule-card {
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border); border-radius: 20px; padding: 20px; margin-bottom: 15px;
          box-shadow: var(--shadow-main); box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
          display: flex; gap: 15px; align-items: flex-start;
        }

        .icon-bg { 
          width: 50px; height: 50px; background: rgba(255,255,255,0.5); border-radius: 14px; 
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.6);
        }

        .rule-title { font-size: 17px; font-weight: 800; color: var(--text-dark); margin-bottom: 6px; }
        .rule-desc { font-size: 14px; color: #444; line-height: 1.6; }
        
        .fade-in-view { opacity: 0; animation: fadeInUp 0.5s forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="page-container">
        {/* Background Bubbles */}
        <div className="floating-bubble" style={{ width: 150, height: 150, borderRadius: '50%', background: 'rgba(108, 99, 255, 0.25)', top: -30, left: -30 }} />
        <div className="floating-bubble" style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(255, 107, 107, 0.2)', bottom: 50, right: -30 }} />

        <div className="main-content">
          <div className="header-row">
            <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft size={18} /></button>
            <h1 className="header-title">ক্লাবের নীতিমালা</h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rulesData.map((rule, idx) => (
              <div key={idx} className="rule-card fade-in-view" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="icon-bg">{rule.icon}</div>
                <div>
                  <div className="rule-title">{rule.title}</div>
                  <div className="rule-desc">{rule.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}