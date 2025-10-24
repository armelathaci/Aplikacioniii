// ✅ Corrected Full Version of HomeDashboard.js

import React, { useState, useEffect } from 'react';
import { 
  FaWallet, FaArrowUp, FaArrowDown, FaPlus, FaTimes, FaHome, 
  FaExchangeAlt, FaBullseye, FaRobot, FaCog, FaQuestionCircle 
} from 'react-icons/fa';
import './HomeDashboard.css';
import logo from '../../img/logo1.png';
import { getHomeDashboardData, createTransaction } from '../../services/api';

export default function HomeDashboard({ onNavigate, loggedInUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    notifications: [],
    spendingByCategory: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [incomeForm, setIncomeForm] = useState({
    name: '',
    amount: '',
    category: 'Të ardhura',
    type: 'income',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchDashboardData = async () => {
    try {
      setError('');
      setIsLoading(true);
      const data = await getHomeDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Nuk mund të ngarkoheshin të dhënat. Provoni përsëri më vonë.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) setIsCollapsed(savedCollapsed === 'true');
    fetchDashboardData();
  }, []);

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    if (!incomeForm.amount || !incomeForm.name) {
      alert("Ju lutem plotësoni emrin dhe shumën.");
      return;
    }
    try {
      await createTransaction({
        name: incomeForm.name,
        amount: incomeForm.amount,
        category: incomeForm.category,
        type: incomeForm.type,
        date: incomeForm.date,
        description: incomeForm.description || incomeForm.name
      });
      setShowIncomeModal(false);
      setIncomeForm({ name: '', amount: '', category: 'Të ardhura', type: 'income', date: new Date().toISOString().split('T')[0], description: '' });
      fetchDashboardData();
    } catch (err) {
      alert(`Gabim: ${err.message}`);
    }
  };

  const handleNavigation = (page) => {
    setSidebarOpen(false);
    onNavigate(page);
  };


  // const dynamicCategories = Object.entries(dashboardData.spendingByCategory).map(([name, value], index) => {

  
  const dynamicCategories = Object.entries(dashboardData.spendingByCategory || {}).map(([name, value], index) => {
    const colors = ['#00b894', '#0984e3', '#e17055', '#6c5ce7', '#fdcb6e', '#636e72'];
    return { name, value, color: colors[index % colors.length] };
  });
  
  const dynamicTotal = dynamicCategories.reduce((sum, c) => sum + c.value, 0);

  if (isLoading) {
    return <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px', fontSize: '1.5rem' }}>Duke ngarkuar Panelin...</div>;
  }

  if (error) {
    return <div style={{ color: '#ff6b6b', textAlign: 'center', paddingTop: '50px', fontSize: '1.5rem' }}>{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => setIsCollapsed(v => { const nv = !v; localStorage.setItem('sidebarCollapsed', String(nv)); return nv; })}>
            <img src={logo} alt="Logo" />
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <nav className="sidebar-menu">
          <button type="button" className="active" onClick={() => handleNavigation('dashboard')}><FaHome /> <span>Ballina</span></button>
          <button type="button" onClick={() => handleNavigation('transaksionet')}><FaExchangeAlt /> <span>Transaksionet</span></button>
          <button type="button" onClick={() => handleNavigation('qellimet')}><FaBullseye /> <span>Qëllimet</span></button>
          <button type="button" onClick={() => handleNavigation('aichat')}><FaRobot className="bot-icon" /> <span>AIChat</span></button>
          <button type="button" onClick={() => handleNavigation('settings')}><FaCog /> <span>Settings</span></button>
          <button type="button" onClick={() => handleNavigation('help')}><FaQuestionCircle /> <span>Ndihmë</span></button>
        </nav>
      </aside>
      
      <main className="dashboard-main">
        <div className="main-content-center">
          <div className="greeting-section">
            <div className="greeting-header">
              <div>
                <h1>Mirë se u riktheve, {loggedInUser.fullName}!</h1>
                <p className="greeting-sub">Ja përmbledhja jote financiare për sot.</p>
              </div>
              <button className="add-income-btn" onClick={() => setShowIncomeModal(true)}>
                <FaPlus /> Shto të ardhura
              </button>
            </div>
          </div>

          <div className="main-balance-section">
            <div className="balance-card">
              <FaWallet className="balance-icon" />
              <div className="balance-label">Bilanci total</div>
              <div className="balance-value">{parseFloat(dashboardData.balance).toFixed(2)}€</div>
            </div>
            <div className="income-card">
              <FaArrowUp className="income-icon" />
              <div className="income-label">Të ardhura mujore</div>
              <div className="income-value">{parseFloat(dashboardData.monthlyIncome).toFixed(2)}€</div>
            </div>
            <div className="expense-card">
              <FaArrowDown className="expense-icon" />
              <div className="expense-label">Shpenzime mujore</div>
              <div className="expense-value">{parseFloat(dashboardData.monthlyExpenses).toFixed(2)}€</div>
            </div>
          </div>
          
          <div className="dashboard-bottom-section">
            <div className="pie-chart-card">
              <div className="pie-title">Shpenzimet sipas kategorive</div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px'}}>
                {dynamicCategories.length > 0 ? (
                  <>
                    <div style={{
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      background: `conic-gradient(${dynamicCategories.map((cat, i) => `${cat.color} ${i === 0 ? 0 : (dynamicCategories.slice(0, i).reduce((a, c) => a + c.value, 0) / dynamicTotal) * 100}%, ${cat.color} ${(dynamicCategories.slice(0, i + 1).reduce((a, c) => a + c.value, 0) / dynamicTotal) * 100}%`).join(', ')})`,
                      border: '1px solid #181926', boxSizing: 'border-box', position: 'relative', marginBottom: '8px',
                    }}>
                    </div>
                    <div className="pie-legend">
                      {dynamicCategories.map(cat => (
                        <div key={cat.name} className="pie-legend-item">
                          <span className="pie-color" style={{background: cat.color}}></span>
                          <span>{cat.name} ({parseFloat(cat.value).toFixed(2)}€)</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#b2bec3' }}>
                    <p style={{margin: '0 0 8px 0', fontSize: '1.1rem'}}>Nuk ka shpenzime</p>
                    <p style={{margin: 0, fontSize: '0.9rem'}}>Shto transaksione për të parë shpenzimet</p>
                  </div>
                )}
              </div>
            </div>
            <div className="compare-notify-section">
              <div className="notifications-list">
                 {dashboardData.notifications.map((n, i) => (
                    <div key={i} className={`notification-card ${n.type}`}>
                      <span>{n.text}</span>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- Modal for adding income --- */}
      {showIncomeModal && (
        <div className="modal-bg">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Shto të ardhura të reja</h3>
              <button className="modal-close-btn" onClick={() => setShowIncomeModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleIncomeSubmit}>
              <div className="form-group">
                <label htmlFor="incomeName">Përshkrimi / Emri *</label>
                <input 
                  type="text" 
                  id="incomeName"
                  placeholder="Psh. Paga e muajit, Bonus, etj."
                  value={incomeForm.name}
                  onChange={e => setIncomeForm(f => ({ ...f, name: e.target.value, description: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="incomeAmount">Shuma (€) *</label>
                <input 
                  type="number" 
                  id="incomeAmount"
                  placeholder="Shkruaj shumën..."
                  value={incomeForm.amount}
                  onChange={e => setIncomeForm(f => ({ ...f, amount: e.target.value }))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowIncomeModal(false)}
                >
                  Anulo
                </button>
                <button type="submit" className="submit-btn">
                  <FaPlus /> Shto të ardhura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
