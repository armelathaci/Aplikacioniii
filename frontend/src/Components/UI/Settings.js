import React, { useState, useEffect, useCallback } from 'react';
import { FaCog, FaUser, FaBell, FaPalette, FaGlobe, FaSignOutAlt, FaTrash, FaEdit, FaEye, FaEyeSlash, FaHome, FaExchangeAlt, FaBullseye, FaRobot, FaQuestionCircle, FaTimes, FaGraduationCap, FaInfoCircle } from 'react-icons/fa';
import './Settings.css';
import logo from '../../img/logo1.png';
import { getProfile, updateProfile, changePassword, getSettings, updateSettings, deleteAccount } from '../../services/api';

export default function Settings({ onNavigate, onLogoutClick, performLogout }) {
  // All modal states except logout
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Data fetching states
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [nameForm, setNameForm] = useState({ fullName: '' });
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [statusForm, setStatusForm] = useState({ status: '', profession: '' });
  const [preferences, setPreferences] = useState({ language: 'Shqip', theme: 'Pamja fillestare', currency: '€' });
  const [notifications, setNotifications] = useState({});
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profileRes, settingsRes] = await Promise.all([getProfile(), getSettings()]);

      const userProfile = profileRes.user || {};
      setProfileData(userProfile);
      setNameForm({ fullName: userProfile.full_name || '' });
      setEmailForm({ email: userProfile.email || '' });
      setStatusForm({ status: userProfile.employment_status || 'Student', profession: userProfile.job_title || '' });

      const userSettings = settingsRes.settings || {};
      setPreferences({ theme: userSettings.theme || 'Pamja fillestare', currency: userSettings.currency || '€' });
      setNotifications({
        newTransactions: !!userSettings.newTransactions,
        completedGoals: !!userSettings.completedGoals,
        budgetReminders: !!userSettings.budgetReminders,
        aiSuggestions: !!userSettings.aiSuggestions,
        appNotifications: !!userSettings.appNotifications,
      });
    } catch (err) {
      setError('Nuk mund të ngarkoheshin cilësimet');
      console.error('Settings loading error:', err);
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) setIsCollapsed(savedCollapsed === 'true');
    fetchAllData();
  }, [fetchAllData]);
  
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const confirmDeleteAccount = async () => {
    try {
        await deleteAccount();
        setShowDeleteModal(false);
        alert("Llogaria juaj është fshirë me sukses.");
        performLogout(); 
    } catch (err) {
        alert(`Gabim gjatë fshirjes së llogarisë: ${err.message}`);
    }
  };

  const handleNameSubmit = async (e) => { e.preventDefault(); try { await updateProfile({ fullName: nameForm.fullName }); setShowNameModal(false); showSuccess('Emri u ndryshua me sukses!'); fetchAllData(); } catch (err) { alert(`Gabim: ${err.message}`); } };
  const handleStatusSubmit = async (e) => { e.preventDefault(); try { await updateProfile({ status: statusForm.status, profession: statusForm.profession }); setShowStatusModal(false); showSuccess('Statusi u ndryshua me sukses!'); fetchAllData(); } catch(err) { alert(`Gabim: ${err.message}`); } };
  const handlePasswordSubmit = async (e) => { e.preventDefault(); if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError("Fjalëkalimet e reja nuk përputhen!"); return; } setPasswordError(''); try { await changePassword(passwordForm); setShowPasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); showSuccess('Fjalëkalimi u ndryshua me sukses!'); } catch (err) { setPasswordError(err.message); } };
  const handleSettingsChange = async (changedSettings) => { try { if (changedSettings.theme || changedSettings.currency) { setPreferences(p => ({ ...p, ...changedSettings })); } else { setNotifications(p => ({ ...p, ...changedSettings })); } await updateSettings(changedSettings); showSuccess("Cilësimet u ruajtën!"); } catch (err) { alert(`Gabim gjatë ruajtjes: ${err.message}`); fetchAllData(); } };
  const handleEmailSubmit = async (e) => { e.preventDefault(); try { await updateProfile({ email: emailForm.email }); setShowEmailModal(false); showSuccess('Emaili u ndryshua me sukses! Ju lutem kyçuni përsëri.'); setTimeout(() => { performLogout(); }, 2000); } catch (err) { alert(`Gabim: ${err.message}`); } };
  const handleNavigation = (page) => { setSidebarOpen(false); onNavigate(page); };
  
  if (isLoading) return <div style={{textAlign: 'center', color: 'white', paddingTop: '50px'}}>Duke ngarkuar Cilësimet...</div>;
  if (error) return <div style={{textAlign: 'center', color: '#ff6b6b', paddingTop: '50px'}}>{error}</div>;

  return (
    <div className="dashboard-container">
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo" onClick={() => setIsCollapsed(v => !v)}><img src={logo} alt="Logo" /></div>
                <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
            </div>
            <nav className="sidebar-menu">
                <button type="button" onClick={() => handleNavigation('dashboard')}><FaHome /> <span>Ballina</span></button>
                <button type="button" onClick={() => handleNavigation('transaksionet')}><FaExchangeAlt /> <span>Transaksionet</span></button>
                <button type="button" onClick={() => handleNavigation('qellimet')}><FaBullseye /> <span>Qëllimet</span></button>
                <button type="button" onClick={() => handleNavigation('aichat')}><FaRobot className="bot-icon" /> <span>AIChat</span></button>
                <button type="button" className="active"><FaCog /> <span>Cilësimet</span></button>
                <button type="button" onClick={() => handleNavigation('help')}><FaQuestionCircle /> <span>Ndihmë</span></button>
            </nav>
        </aside>
      
      <main className="dashboard-main">
        <div className="main-content-center">
          <div className="settings-header">
            <div className="header-content">
              <h1>CILËSIMET</h1>
              <p>Menaxhoni profilin dhe preferencat tuaja</p>
            </div>
          </div>
          {successMessage && <div className="success-message"><span>{successMessage}</span></div>}
          <div className="settings-grid">
            <div className="settings-column">
              <section className="settings-section profile-section">
                <div className="section-header">
                  <div className="header-icon"><FaUser /></div>
                  <div className="header-text">
                    <h2>Profili</h2>
                    <p>Informacionet personale dhe profesionale</p>
                  </div>
                </div>
                <div className="profile-info-grid">
                  <div className="info-card">
                    <div className="info-header"><FaUser className="info-icon" /><span>Emri dhe Mbiemri</span></div>
                    <div className="info-value">{profileData.full_name}</div>
                    <button className="info-action-btn" onClick={() => setShowNameModal(true)}><FaEdit /> Ndrysho</button>
                  </div>
                  <div className="info-card">
                    <div className="info-header"><FaGlobe className="info-icon" /><span>Email-i</span></div>
                    <div className="info-value">{profileData.email}</div>
                    <button className="info-action-btn" onClick={() => setShowEmailModal(true)}><FaEdit /> Ndrysho</button>
                  </div>
                  <div className="info-card">
                    <div className="info-header"><FaGraduationCap className="info-icon" /><span>Statusi i profesionit</span></div>
                    <div className="info-value">{profileData.employment_status || 'Student'}</div>
                    <button className="info-action-btn" onClick={() => setShowStatusModal(true)}><FaEdit /> Ndrysho</button>
                  </div>
                </div>
                <div className="profile-actions">
                  <button className="action-btn primary" onClick={() => setShowPasswordModal(true)}><FaEdit /> Ndrysho fjalëkalimin</button>
                  <div className="action-buttons">
                    <button className="action-btn warning" onClick={onLogoutClick}><FaSignOutAlt /> Dil nga llogaria</button>
                    <button className="action-btn danger" onClick={() => setShowDeleteModal(true)}><FaTrash /> Fshi llogarinë</button>
                  </div>
                </div>
              </section>
            </div>
            <div className="settings-column">
              <section className="settings-section preferences-section">
                <div className="section-header">
                  <div className="header-icon"><FaPalette /></div>
                  <div className="header-text">
                    <h2>Preferencat</h2>
                    <p>Personalizoni përvojën tuaj</p>
                  </div>
                </div>
                <div className="preferences-content">
                  <div className="preference-item"><label>Gjuha</label><div className="language-display"><span>Shqip</span></div></div>
                  <div className="preference-item">
                    <label>Stili i pamjes</label>
                    <select value={preferences.theme} onChange={(e) => handleSettingsChange({ theme: e.target.value })}>
                      <option>Pamja fillestare</option><option>Dritë</option><option>Errët</option>
                    </select>
                  </div>
                  <div className="preference-item">
                    <label>Valuta</label>
                    <select value={preferences.currency} onChange={(e) => handleSettingsChange({ currency: e.target.value })}>
                      <option>€ (Euro)</option><option>L (Lekë)</option><option>$ (Dollar)</option>
                    </select>
                  </div>
                </div>
              </section>
              <section className="settings-section notifications-section">
                <div className="section-header">
                  <div className="header-icon"><FaBell /></div>
                  <div className="header-text">
                    <h2>Njoftimet</h2>
                    <p>Kontrolloni njoftimet që merrni</p>
                  </div>
                </div>
                <div className="notifications-content">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div className="notification-item" key={key}>
                      <label><span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span></label>
                      <div className={`toggle-switch ${value ? 'on' : ''}`} onClick={() => handleSettingsChange({ [key]: !value })}></div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="settings-section other-section">
                <div className="section-header">
                  <div className="header-icon"><FaCog /></div>
                  <div className="header-text"><h2>Të tjera</h2><p>Opsione shtesë</p></div>
                </div>
                <div className="other-content">
                  <button className="about-btn" onClick={() => setShowAboutModal(true)}><FaInfoCircle /> Rreth aplikacionit</button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      {/* (All modals remain the same) */}
      
      {showNameModal && (
        <div className="modal-bg">
          <div className="modal-content">
            <div className="modal-header"><h3>Ndrysho emrin</h3><button className="modal-close-btn" onClick={() => setShowNameModal(false)}><FaTimes /></button></div>
            <form onSubmit={handleNameSubmit} className="modal-form">
              <div className="form-group">
                <label>Emri i plotë:</label>
                <input type="text" value={nameForm.fullName} onChange={(e) => setNameForm({ fullName: e.target.value })} required />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowNameModal(false)}>Anulo</button>
                <button type="submit" className="submit-btn">Ruaj</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="modal-bg">
          <div className="modal-content">
            <div className="modal-header"><h3>Ndrysho emailin</h3><button className="modal-close-btn" onClick={() => setShowEmailModal(false)}><FaTimes /></button></div>
            <form onSubmit={handleEmailSubmit} className="modal-form">
              <div className="form-group">
                <label>Email i ri:</label>
                <input type="email" value={emailForm.email} onChange={(e) => setEmailForm({ email: e.target.value })} required />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEmailModal(false)}>Anulo</button>
                <button type="submit" className="submit-btn">Ruaj</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="modal-bg">
          <div className="modal-content">
            <div className="modal-header"><h3>Ndrysho statusin dhe profesionin</h3><button className="modal-close-btn" onClick={() => setShowStatusModal(false)}><FaTimes /></button></div>
            <form onSubmit={handleStatusSubmit} className="modal-form">
              <div className="form-group">
                <label>Statusi i Punësimit:</label>
                <select value={statusForm.status} onChange={(e) => setStatusForm(prev => ({...prev, status: e.target.value}))}>
                  <option value="Student">Student</option><option value="I punësuar">I punësuar</option><option value="I papunësuar">I papunësuar</option>
                </select>
              </div>
              <div className="form-group">
                <label>Profesioni:</label>
                <input type="text" value={statusForm.profession} onChange={(e) => setStatusForm(prev => ({...prev, profession: e.target.value}))} />
              </div>
              <div className="form-actions"><button type="button" className="cancel-btn" onClick={() => setShowStatusModal(false)}>Anulo</button><button type="submit" className="submit-btn">Ruaj</button></div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-bg">
          <div className="modal-content">
            <div className="modal-header"><h3>Ndrysho fjalëkalimin</h3><button className="modal-close-btn" onClick={() => setShowPasswordModal(false)}><FaTimes /></button></div>
            <form onSubmit={handlePasswordSubmit} className="modal-form">
              <div className="form-group"><label>Fjalëkalimi aktual:</label><div className="password-input-container"><input type={showCurrentPassword ? "text" : "password"} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(p => ({...p, currentPassword: e.target.value}))} required /><button type="button" className="password-toggle-btn" onClick={() => setShowCurrentPassword(v => !v)}>{showCurrentPassword ? <FaEyeSlash /> : <FaEye />}</button></div></div>
              <div className="form-group"><label>Fjalëkalimi i ri:</label><div className="password-input-container"><input type={showNewPassword ? "text" : "password"} value={passwordForm.newPassword} onChange={(e) => setPasswordForm(p => ({...p, newPassword: e.target.value}))} required /><button type="button" className="password-toggle-btn" onClick={() => setShowNewPassword(v => !v)}>{showNewPassword ? <FaEyeSlash /> : <FaEye />}</button></div></div>
              <div className="form-group"><label>Konfirmo fjalëkalimin e ri:</label><div className="password-input-container"><input type={showConfirmPassword ? "text" : "password"} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(p => ({...p, confirmPassword: e.target.value}))} required /><button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(v => !v)}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button></div></div>
              {passwordError && <div style={{color: 'red', textAlign: 'center', marginTop: '10px'}}>{passwordError}</div>}
              <div className="form-actions"><button type="button" className="cancel-btn" onClick={() => setShowPasswordModal(false)}>Anulo</button><button type="submit" className="submit-btn">Ruaj</button></div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-bg">
          <div className="modal-content delete-modal">
            <div className="modal-header"><h3>Konfirmo fshirjen e llogarisë</h3><button className="modal-close-btn" onClick={() => setShowDeleteModal(false)}><FaTimes /></button></div>
            <div className="modal-body">
              <div className="warning-icon"><FaTrash /></div>
              <p>A jeni të sigurt që dëshironi të fshini llogarinë?</p>
              <p className="warning-text">Kjo veprim nuk mund të kthehet mbrapsht dhe do të humbni të gjitha të dhënat tuaja.</p>
            </div>
            <div className="modal-actions"><button type="button" className="cancel-btn" onClick={() => setShowDeleteModal(false)}>Anulo</button><button type="button" className="delete-confirm-btn" onClick={confirmDeleteAccount}>Po, fshi llogarinë</button></div>
          </div>
        </div>
      )}
      
      {showAboutModal && (
        <div className="modal-bg">
          <div className="modal-content about-modal">
            <div className="modal-header"><h3>Rreth aplikacionit</h3><button className="modal-close-btn" onClick={() => setShowAboutModal(false)}><FaTimes /></button></div>
            <div className="modal-body">
              <div className="app-info">
                <div className="app-logo"><img src={logo} alt="Logo" /></div>
                <h4>Ruaj Mençur</h4>
                <div className="info-section">
                  <h5>Çfarë është Ruaj Mençur?</h5><p>Një aplikacion modern për menaxhimin e financave personale...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      
    </div>
  );
}