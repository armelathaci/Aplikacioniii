// frontend/src/Components/Auth/RegisterForm.js

// Importimi i librarive të nevojshme nga React
import React, { useState, useEffect } from 'react';
// Importimi i stileve CSS
import './AuthLayout.css';
// Importimi i ikonave
import emailIcon from '../../img/email-icon-removebg-preview.png';
import userIcon from '../../img/user.icon.png';
// Importimi i komponentit të fjalëkalimit
import PasswordInput from './PasswordInput';
// --- NEW: Import the register function from our API service ---
import { register } from '../../services/api';

// Komponenti i formularit të regjistrimit
function RegisterForm({ onSwitch }) {
  // Your existing state for form fields remains the same
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // --- NEW: State for handling errors and success messages from the backend ---
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hook për të kontrolluar madhësinë e ekranit
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 425);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Your existing months and years arrays remain the same
  const months = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // --- MODIFIED: The handleSubmit function now calls the backend API ---
  const handleSubmit = async (e) => { // <-- Made the function async
    e.preventDefault();
    // Clear previous messages
    setError('');
    setSuccess('');

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen!');
      return;
    }
    if (!birthDay || !birthMonth || !birthYear) {
      setError('Ju lutem zgjidhni datën e lindjes!');
      return;
    }

    // Prepare the data object to send to the backend
    const userData = {
      fullName: username,
      email: email,
      password: password,
      day: birthDay,
      month: birthMonth,
      year: birthYear,
    };

    try {
      // --- This is the API call ---
      const data = await register(userData);
      setSuccess(data.message + " Ju mund të kyçeni tani."); // Set success message from backend
      
      // Automatically switch to the login page after a short delay
      setTimeout(() => {
        onSwitch(); // This function was passed from App.js to switch the view
      }, 2000);

    } catch (err) {
      // If the API call fails, display the error message from the backend
      setError(err.message);
    }
  };

  return (
    <form className="login-glass" onSubmit={handleSubmit} style={{
      margin: '0 auto', 
      maxWidth: isMobile ? '98vw' : 600,
      width: '100%',
      padding: isMobile ? '12px 8px' : '8px 20px',
      fontSize: isMobile ? '0.95rem' : '1.32rem',
      boxSizing: 'border-box'
    }}>
      <h2 style={{
        textAlign: 'center', 
        marginBottom: isMobile ? 12 : 24, 
        fontWeight: 800, 
        fontSize: isMobile ? '1.4rem' : 'clamp(2.2rem, 5vw, 3.2rem)',
        letterSpacing: 1
      }}>Krijo llogari</h2>

      {/* --- NEW: A section to display error or success messages --- */}
      {error && <p style={{color: '#ff6b6b', textAlign: 'center', fontSize: '1rem', padding: '0 10px'}}>{error}</p>}
      {success && <p style={{color: '#1de9b6', textAlign: 'center', fontSize: '1rem', padding: '0 10px'}}>{success}</p>}
      
      {/* Kontenieri për input-in e emrit */}
      <div style={{position: 'relative', marginBottom: isMobile ? 6 : 12}}>
        <span className="input-icon" style={{
          left: isMobile ? 8 : 10, 
          top: '40%', 
          position: 'absolute', 
          transform: 'translateY(-50%)', 
          display: 'flex', 
          alignItems: 'center', 
          height: isMobile ? 36 : 44
        }}>
          <img src={userIcon} alt="User" width={isMobile ? 20 : 26} height={isMobile ? 20 : 26} style={{display: 'block', filter: 'brightness(0) invert(1) brightness(1.5)'}} />
        </span>
        <input
          className="login-input"
          type="text"
          placeholder="Emri dhe Mbiemri"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={isMobile ? {paddingLeft: 36, height: 36} : {}}
        />
      </div>
      
      {/* Kontenieri për input-in e email-it */}
      <div style={{position: 'relative', marginBottom: isMobile ? 6 : 12}}>
        <span className="input-icon" style={{
          left: isMobile ? 8 : 14, 
          top: '40%', 
          position: 'absolute', 
          transform: 'translateY(-50%)', 
          display: 'flex', 
          alignItems: 'center', 
          height: isMobile ? 36 : 44
        }}>
          <img src={emailIcon} alt="Email" width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} style={{display: 'block', filter: 'brightness(0) invert(1)'}} />
        </span>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={isMobile ? {paddingLeft: 36, height: 36} : {paddingLeft: 44, height: 44}}
        />
      </div>
      
      {/* Fushat për datën e lindjes */}
      <div style={{marginBottom: isMobile ? 6 : 12}}>
        <label style={{
          color: '#eaffff', 
          fontSize: isMobile ? '0.9rem' : '1.1rem', 
          marginBottom: isMobile ? 4 : 8, 
          display: 'block'
        }}>Data e lindjes</label>
        <div className="birthdate-row">
          <select className="login-input birthdate-select" value={birthDay} onChange={e => setBirthDay(e.target.value)} required style={isMobile ? {height: 36, fontSize: '0.9rem'} : {}}>
            <option value="">Dita</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => <option key={day} value={day}>{day}</option>)}
          </select>
          <select className="login-input birthdate-select" value={birthMonth} onChange={e => setBirthMonth(e.target.value)} required style={isMobile ? {height: 36, fontSize: '0.9rem'} : {}}>
            <option value="">Muaji</option>
            {months.map((month, index) => <option key={index + 1} value={index + 1}>{month}</option>)}
          </select>
          <select className="login-input birthdate-select" value={birthYear} onChange={e => setBirthYear(e.target.value)} required style={isMobile ? {height: 36, fontSize: '0.9rem'} : {}}>
            <option value="">Viti</option>
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>

      {/* Kontenieri për input-in e fjalëkalimit */}
      <div style={{marginBottom: isMobile ? 6 : 12}}>
          <PasswordInput
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Fjalëkalimi"
            required
          />
      </div>
      
      {/* Kontenieri për konfirmimin e fjalëkalimit */}
      <div style={{marginBottom: isMobile ? 6 : 12}}>
          <PasswordInput
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Konfirmo fjalëkalimin"
            required
          />
      </div>
      
      {/* Butoni kryesor për të bërë regjistrim */}
      <button type="submit" style={{
        width: isMobile ? '85%' : '50%',
        background: '#00b894',
        color: '#fff',
        border: 'none',
        borderRadius: isMobile ? 8 : 12,
        padding: isMobile ? '8px 0' : '12px 0',
        fontWeight: 700,
        fontSize: isMobile ? '0.9rem' : '1.15rem',
        marginTop: 8,
        boxShadow: '0 4px 20px rgba(0, 184, 148, 0.4)',
        cursor: 'pointer',
        letterSpacing: 1,
        transition: 'all 0.3s ease',
        minWidth: isMobile ? 100 : 160,
        display: 'block',
        margin: '8px auto 0 auto'
      }}
      onMouseOver={(e) => e.target.style.background = '#1dd1a1'}
      onMouseOut={(e) => e.target.style.background = '#00b894'}>
        Regjistrohu
      </button>
      
      {/* Link-u për të kaluar në login */}
      <div style={{textAlign: 'center', marginTop: isMobile ? 8 : 12}}>
        <button 
          type="button" 
          className="form-link" 
          style={{
            color: '#00eaff', 
            background: 'none', 
            border: 'none', 
            fontWeight: 600, 
            cursor: 'pointer', 
            fontSize: isMobile ? '0.85rem' : '1.18rem'
          }} 
          onClick={onSwitch}
        >
          Ke llogari? Kyçu këtu.
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;