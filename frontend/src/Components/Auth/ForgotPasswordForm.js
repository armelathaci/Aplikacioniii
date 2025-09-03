import React, { useState } from 'react';
import './AuthLayout.css';
import emailIcon from '../../img/email-icon-removebg-preview.png';
import { forgotPassword } from '../../services/api'; 

function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('');
  // --- NEW: State for loading, success, and error messages ---
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(''); // This will hold the success message
  const [error, setError] = useState('');

  // --- MODIFIED: handleSubmit now calls the backend ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await forgotPassword(email); // <-- CALL THE API
      setMessage(data.message); // Set the success message from the backend
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // If a message is set, it means the form was submitted successfully.
  // We show a confirmation view instead of the form.
  if (message) {
    return (
      <div className="login-glass" style={{textAlign: 'center'}}>
        <h2 style={{fontSize: '1.5rem'}}>Kontrolloni Emailin Tuaj</h2>
        <p style={{color: '#eaffff', fontSize: '1rem', marginBottom: '20px'}}>
          {message}
        </p>
        <button className="form-link" style={{color: '#00eaff', background: 'none', border: 'none', cursor: 'pointer'}} onClick={onBack}>
          Kthehu te kyçja
        </button>
      </div>
    );
  }

  return (
    <form className="login-glass" onSubmit={handleSubmit}>
      <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Harruat Fjalëkalimin?</h2>
      <p style={{textAlign: 'center', color: '#b2dfdb', fontSize: '1rem', marginTop: 0, marginBottom: '25px'}}>
        Shkruani emailin tuaj dhe ne do t'ju dërgojmë një link për të rivendosur fjalëkalimin.
      </p>

      {error && <p style={{color: '#ff6b6b', textAlign: 'center', fontSize: '1rem'}}>{error}</p>}

      <div style={{position: 'relative', marginBottom: '20px'}}>
        <span className="input-icon" style={{left: 14, top: '50%', transform: 'translateY(-50%)'}}>
          <img src={emailIcon} alt="Email" width={22} height={22} style={{filter: 'brightness(0) invert(1)'}} />
        </span>
        <input
          className="login-input"
          type="email"
          placeholder="Shkruaj emailin"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{paddingLeft: 44}}
        />
      </div>

      <button type="submit" className="center-btn" disabled={isLoading} style={{
          background: '#00eaff', color: '#003b4a', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, 
          cursor: 'pointer', opacity: isLoading ? 0.7 : 1
      }}>
        {isLoading ? 'Duke dërguar...' : 'Dërgo Linkun'}
      </button>

      <div style={{textAlign: 'center', marginTop: '15px'}}>
        <button type="button" className="form-link" style={{color: '#00eaff', background: 'none', border: 'none', cursor: 'pointer'}} onClick={onBack}>
          Kthehu te kyçja
        </button>
      </div>
    </form>
  );
}

export default ForgotPasswordForm;