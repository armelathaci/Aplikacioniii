// frontend/src/App.js

import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import LoginForm from './Components/Auth/LoginForm';
import RegisterForm from './Components/Auth/RegisterForm';
import ForgotPasswordForm from './Components/Auth/ForgotPasswordForm';
import AuthLayout from './Components/Auth/AuthLayout';
import './App.css';
import HomeDashboard from './Components/Dashboard/HomeDashboard';
import Transaksionet from './Components/Dashboard/Transaksionet';
import Qellimet from './Components/Dashboard/Qellimet';
import AIChat from './Components/Chat/AIChat';
import Settings from './Components/UI/Settings';
import Help from './Components/UI/Help';
import ResetPasswordWrapper from './Components/Auth/ResetPasswordForm';

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- The state for the logout modal now lives here ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/reset-password') {
      setPage('reset-password');
      setIsLoading(false);
      return;
    }
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setPage('dashboard');
    }
    setIsLoading(false);
  }, []);
  
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setPage('dashboard');
  };
  
  // This function is for the modal's "Confirm" button
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('login');
    setShowLogoutModal(false); // Close the modal
  };
  
  // This function will be passed to child components to trigger the modal
  const openLogoutModal = () => {
      setShowLogoutModal(true);
  };

  if (isLoading) {
    return <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>Loading...</div>;
  }
  
  if (user) {
    const renderPage = () => {
      switch (page) {
        case 'dashboard':
          return <HomeDashboard onNavigate={setPage} onLogout={openLogoutModal} loggedInUser={user} />;
        case 'transaksionet':
          return <Transaksionet onNavigate={setPage} onLogout={openLogoutModal} />;
        case 'qellimet':
          return <Qellimet onNavigate={setPage} onLogout={openLogoutModal} />;
        case 'aichat':
          return <AIChat onNavigate={setPage} onLogout={openLogoutModal} user={user} />;
        case 'settings':
          // --- THE FIX: We pass the correct function to open the modal ---
          return <Settings onNavigate={setPage} onLogoutClick={openLogoutModal} performLogout={handleLogout} />;
        case 'help':
          return <Help onNavigate={setPage} onLogout={openLogoutModal} />;
        default:
          return <HomeDashboard onNavigate={setPage} onLogout={openLogoutModal} loggedInUser={user} />;
      }
    };

    return (
      <>
        {renderPage()}
        
        {/* The logout confirmation modal is now part of App.js */}
        {showLogoutModal && (
          <div className="modal-bg">
            <div className="modal-content">
              <div className="modal-header">
                <h3>KONFIRMO DALJEN</h3>
                <button className="modal-close-btn" onClick={() => setShowLogoutModal(false)}><FaTimes /></button>
              </div>
              <div className="modal-body"><p>A jeni të sigurt që dëshironi të dilni nga llogaria?</p></div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowLogoutModal(false)}>ANULO</button>
                <button type="button" className="confirm-btn" onClick={handleLogout}>PO, DIL</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <AuthLayout>
      {page === 'login' && <LoginForm onSwitch={() => setPage('register')} onForgotPassword={() => setPage('forgot')} onLogin={handleLogin} />}
      {page === 'register' && <RegisterForm onSwitch={() => setPage('login')} />}
      {page === 'forgot' && <ForgotPasswordForm onBack={() => setPage('login')} />}
      {page === 'reset-password' && <ResetPasswordWrapper onBack={() => {
          window.history.pushState({}, '', '/'); 
          setPage('login');
      }} />}
    </AuthLayout>
  );
}

export default App;