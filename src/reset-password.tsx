import { showToast } from './toast';
// reset-password.tsx – Ekotaboddho B.P Reset Password (Web)
// Single file with inline <style>, React + TypeScript, React Router, React Icons

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api'; // আপনার API URL

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      showToast('রিসেট টোকেন পাওয়া যায়নি');
      return;
    }
    if (!newPassword || !confirmPassword) {
      showToast('উভয় পাসওয়ার্ড দিন');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('পাসওয়ার্ড দুটি মেলে নি');
      return;
    }
    if (newPassword.length < 6) {
      showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        navigate('/', { replace: true });
      } else {
        showToast(data.message || 'রিসেট ব্যর্থ হয়েছে');
      }
    } catch (err) {
      showToast('সার্ভার সমস্যা');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --primary: #00adb5;
          --bg: #f8f9fa;
          --card-bg: #ffffff;
          --text-dark: #333333;
          --text-muted: #888888;
          --text-light: #aaaaaa;
          --border: #eeeeee;
          --shadow-accent: 0 4px 8px rgba(0, 173, 181, 0.25);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: var(--bg);
          color: var(--text-dark);
        }

        .reset-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .reset-content {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px 25px;
          background-color: var(--card-bg);
          border-radius: 24px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .reset-title {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: 8px;
          text-align: center;
        }

        .reset-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          text-align: center;
          margin-bottom: 30px;
          line-height: 20px;
        }

        .input-group {
          display: flex;
          align-items: center;
          background-color: #fff;
          border-radius: 14px;
          padding: 0 15px;
          width: 100%;
          border: 1px solid var(--border);
          margin-bottom: 15px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .input-group:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0, 173, 181, 0.1);
        }

        .input-icon {
          margin-right: 10px;
          flex-shrink: 0;
        }

        .reset-input {
          flex: 1;
          padding: 15px 0;
          font-size: 16px;
          color: var(--text-dark);
          background: transparent;
          border: none;
          outline: none;
        }

        .reset-input::placeholder {
          color: var(--text-light);
        }

        .reset-btn {
          background-color: var(--primary);
          padding: 16px;
          border: none;
          border-radius: 14px;
          width: 100%;
          cursor: pointer;
          margin-top: 10px;
          box-shadow: var(--shadow-accent);
          transition: background-color 0.3s ease, transform 0.1s ease, opacity 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          color: #fff;
        }

        .reset-btn:hover:not(:disabled) {
          background-color: #009099;
        }

        .reset-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .reset-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 22px;
          height: 22px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .back-link {
          margin-top: 20px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--primary);
          font-weight: 600;
          font-size: 14px;
          transition: opacity 0.2s ease;
        }

        .back-link:hover {
          opacity: 0.7;
          text-decoration: underline;
        }
      `}</style>

      <div className="reset-container">
        <div className="reset-content">
          <h1 className="reset-title">নতুন পাসওয়ার্ড সেট করুন</h1>
          <p className="reset-subtitle">
            একটি শক্তিশালী পাসওয়ার্ড দিন যা আপনি মনে রাখতে পারবেন।
          </p>

          {/* নতুন পাসওয়ার্ড */}
          <div className="input-group">
            <FiLock size={20} color="#888" className="input-icon" />
            <input
              type="password"
              className="reset-input"
              placeholder="নতুন পাসওয়ার্ড"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {/* কনফার্ম পাসওয়ার্ড */}
          <div className="input-group">
            <FiLock size={20} color="#888" className="input-icon" />
            <input
              type="password"
              className="reset-input"
              placeholder="পাসওয়ার্ড আবার লিখুন"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button
            type="button"
            className="reset-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              'পাসওয়ার্ড পরিবর্তন করুন'
            )}
          </button>

          <button
            type="button"
            className="back-link"
            onClick={() => navigate('/', { replace: true })}
          >
            লগইনে ফিরে যান
          </button>
        </div>
      </div>
    </>
  );
}