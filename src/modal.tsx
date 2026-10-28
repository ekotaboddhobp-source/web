// modal.tsx – Ekotaboddho B.P Modal Screen (Web)
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ModalScreen() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .modal-container {
          background-color: #fff;
          border-radius: 20px;
          padding: 30px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          animation: modalFadeIn 0.3s ease;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-title {
          font-size: 24px;
          font-weight: 800;
          color: #333;
          margin-bottom: 10px;
        }
        .modal-link {
          display: inline-block;
          margin-top: 15px;
          padding: 12px 20px;
          background: none;
          border: 2px solid #00adb5;
          border-radius: 12px;
          color: #00adb5;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .modal-link:hover {
          background-color: #00adb5;
          color: #fff;
        }
      `}</style>

      <div className="modal-container">
        <h1 className="modal-title">This is a modal</h1>
        <button className="modal-link" onClick={() => navigate('/')}>
          Go to home screen
        </button>
      </div>
    </>
  );
}