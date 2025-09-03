// frontend/src/Components/Auth/ResetPasswordForm.js

import React, { useState, useEffect } from 'react';
// --- THIS IS THE FIX: All imports are now on one line at the top ---
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './AuthLayout.css';
import PasswordInput from './PasswordInput';
import { resetPassword } from '../../services/api';

function ResetPasswordForm({ onBack }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    if (urlToken && urlEmail) {
      setToken(urlToken);
      setEmail(urlEmail);
    } else {
      setError("Link i pavlefshëm ose i skaduar.");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Fjalëkalimet nuk përputhen!");
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await resetPassword({ token, email, password });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (message) {
    return (
      <div className="login-glass" style={{textAlign: 'center'}}>
        <h2 style={{fontSize: '1.5rem'}}>Sukses!</h2>
        <p style={{color: '#eaffff', fontSize: '1rem', marginBottom: '20px'}}>{message}</p>
        <button className="form-link" onClick={onBack}>Kthehu te kyçja</button>
      </div>
    );
  }

  return (
    <form className="login-glass" onSubmit={handleSubmit}>
      <h2>Vendos Fjalëkalimin e Ri</h2>
      {error && <p style={{color: '#ff6b6b', textAlign: 'center', fontSize: '1rem'}}>{error}</p>}
      
      <div style={{marginBottom: 12}}>
        <PasswordInput
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Fjalëkalimi i ri"
          required
        />
      </div>
      <div style={{marginBottom: 20}}>
        <PasswordInput
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Konfirmo fjalëkalimin e ri"
          required
        />
      </div>
      
      <button type="submit" className="center-btn" disabled={isLoading || !token}>
        {isLoading ? 'Duke ruajtur...' : 'Ndrysho Fjalëkalimin'}
      </button>
    </form>
  );
}
    
export default function ResetPasswordWrapper(props) {
    return (
        <Router>
            <Routes>
                <Route path="*" element={<ResetPasswordForm {...props} />} />
            </Routes>
        </Router>
    );
}