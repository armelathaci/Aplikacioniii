// frontend/src/Components/Auth/LoginForm.js

import React, { useState } from 'react';
import './AuthLayout.css';
import emailIcon from '../../img/email-icon-removebg-preview.png';
import { login } from '../../services/api'; // <-- IMPORT THE API FUNCTION

function LoginForm({ onSwitch, onForgotPassword, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // --- NEW: State for handling errors ---
  const [error, setError] = useState('');

  // --- MODIFIED: The handleSubmit function now calls the backend ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!email.trim() || !password.trim()) {
      setError('Ju lutem plotësoni të gjitha fushat!');
      return;
    }
    
    try {
      const data = await login(email, password); // <-- CALL THE API
      // On success, the backend returns { success: true, token, user }
      onLogin(data.user, data.token); // <-- Pass the user object and the token up to App.js
    } catch (err) {
      setError(err.message); // <-- Display login errors from the backend to the user
    }
  };

  return (
    <form className="login-glass" onSubmit={handleSubmit} style={{ maxWidth: 600, padding: '48px 36px', fontSize: '1.32rem'}}>
      <h2 style={{textAlign: 'center', marginBottom: 26, fontWeight: 700, fontSize: '2.4rem', letterSpacing: 1}}>Kyçu në llogari</h2>

      {/* --- NEW: Display error messages --- */}
      {error && <p style={{color: '#ff6b6b', textAlign: 'center', fontSize: '1rem'}}>{error}</p>}
      
      {/* Input for Email */}
      <div style={{position: 'relative', marginBottom: 12}}>
        <span className="input-icon" style={{left: 14, top: '40%', position: 'absolute', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', height: 44}}>
          <img src={emailIcon} alt="Email" width={22} height={22} style={{display: 'block', filter: 'brightness(0) invert(1)'}} />
        </span>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{paddingLeft: 44, height: 44}}
        />
      </div>
      
      {/* Input for Password */}
      <div style={{position: 'relative', marginBottom: 12}}>
        <span className="input-icon" style={{left: 14, top: '40%', position: 'absolute', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', height: 44}}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" style={{filter: 'brightness(0) invert(1)'}}>
            <path d="M17 11V7a5 5 0 10-10 0v4" stroke="#00eaff" strokeWidth="1.5"/>
            <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="#00eaff" strokeWidth="1.5"/>
            <circle cx="12" cy="15.5" r="1.5" fill="#00eaff"/>
          </svg>
        </span>
        <input
          className="login-input"
          type="password"
          placeholder="Fjalëkalimi"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{paddingLeft: 44, height: 44}}
        />
      </div>
      
      {/* Forgot Password Link */}
      <div style={{textAlign: 'right', marginBottom: 10}}>
        <button type="button" className="form-link" style={{color: '#00eaff', background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer', fontSize: '0.97rem', padding: 0}} onClick={onForgotPassword}>
          Ke harruar fjalëkalimin?
        </button>
      </div>
      
      {/* Submit Button */}
      <button type="submit" style={{ width: '28%', background: '#00b894', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 0', fontWeight: 700, fontSize: '0.8rem', marginTop: 8, boxShadow: '0 4px 20px rgba(0, 184, 148, 0.4)', cursor: 'pointer', letterSpacing: 1, transition: 'all 0.3s ease', margin: '8px auto 0 auto', display: 'block' }} onMouseOver={(e) => e.target.style.background = '#1dd1a1'} onMouseOut={(e) => e.target.style.background = '#00b894'}>
        Kyçu
      </button>
      
      {/* Link to Register */}
      <div style={{textAlign: 'center', marginTop: 12}}>
        <button type="button" className="form-link" style={{color: '#00eaff', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '1.18rem'}} onClick={onSwitch}>
          Nuk ke llogari? Regjistrohu këtu.
        </button>
      </div>
    </form>
  );
}

export default LoginForm;