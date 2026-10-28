// main.tsx – Ekotaboddho B.P Routing Setup (Web)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages Import
import LoginScreen from './index';
import Dashboard from './dashboard';
import RegisterScreen from './register';
import ResetPasswordScreen from './reset-password';
import Verify2FAScreen from './verify-2fa';
import VerifyCodeScreen from './verify-code';
import ForgotPasswordScreen from './forgot-password';
import SuperAdminScreen from './superadmin';
import MembersScreen from './members';
import NoticesScreen from './notices';
import ProfileScreen from './profile';
import EditProfileScreen from './profile-edit';
import ChangePasswordScreen from './profile-password';
import RulesScreen from './rules'; // ✅ নতুন রুলস পেজ
import PollScreen from './poll';
import EventsScreen from './events';
import ModalScreen from './modal';

// ==================== Route Guards ====================

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const isVerified = localStorage.getItem('superAdminVerified') === 'true';
  return isVerified ? <>{children}</> : <Navigate to="/" replace />;
}

// ==================== App Rendering ====================

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ==================== Public Routes ==================== */}
        <Route path="/" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        <Route path="/verify-2fa" element={<Verify2FAScreen />} />
        <Route path="/verify-code" element={<VerifyCodeScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/modal" element={<ModalScreen />} />

        {/* ==================== Protected User Routes ==================== */}
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/members" element={<RequireAuth><MembersScreen /></RequireAuth>} />
        <Route path="/notices" element={<RequireAuth><NoticesScreen /></RequireAuth>} />
        <Route path="/poll" element={<RequireAuth><PollScreen /></RequireAuth>} />
        <Route path="/events" element={<RequireAuth><EventsScreen /></RequireAuth>} />
        
        {/* Profile Section */}
        <Route path="/profile" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
        <Route path="/profile/edit" element={<RequireAuth><EditProfileScreen /></RequireAuth>} />
        <Route path="/profile/password" element={<RequireAuth><ChangePasswordScreen /></RequireAuth>} />
        <Route path="/rules" element={<RequireAuth><RulesScreen /></RequireAuth>} /> {/* ✅ নতুন রাউট */}

        {/* ==================== Admin Routes ==================== */}
        <Route path="/superadmin" element={<RequireSuperAdmin><SuperAdminScreen /></RequireSuperAdmin>} />
        <Route path="/admin" element={<Navigate to="/superadmin" replace />} />

        {/* ==================== Fallback (404 Not Found) ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);