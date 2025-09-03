// frontend/src/Components/Dashboard/Transaksionet.js

import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import './Transaksionet.css';
import logo from '../../img/logo1.png';
// --- FIX: Remove unused FaBars ---
import { FaHome, FaExchangeAlt, FaBullseye, FaRobot, FaCog, FaQuestionCircle, FaEdit, FaTrash, FaPlus, FaUtensils, FaBus, FaMoneyBillWave, FaFilm, FaQuestion, FaTimes } from 'react-icons/fa';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../../services/api';

const kategoriaOptions = [
    { value: 'Ushqim', label: 'Ushqim', icon: <FaUtensils /> },
    { value: 'Transport', label: 'Transport', icon: <FaBus /> },
    { value: 'Të ardhura', label: 'Të ardhura', icon: <FaMoneyBillWave /> },
    { value: 'Argëtim', label: 'Argëtim', icon: <FaFilm /> },
    { value: 'Fatura', label: 'Fatura', icon: <FaMoneyBillWave /> },
    { value: 'Blerje', label: 'Blerje', icon: <FaMoneyBillWave /> },
    { value: 'Shëndetësi', label: 'Shëndetësi', icon: <FaMoneyBillWave /> },
    { value: 'Edukim', label: 'Edukim', icon: <FaMoneyBillWave /> },
    { value: 'Të tjera', label: 'Të tjera', icon: <FaQuestion /> },
];
const llojiOptions = [
    { label: 'Të ardhura', value: 'income' },
    { label: 'Shpenzim', value: 'expense' }
];
const metodaOptions = ['Cash', 'Karte', 'Transfer', 'Paypal', 'Tjetër'];

function getIconForCategory(cat) {
  const found = kategoriaOptions.find(k => k.value === cat);
  return found ? found.icon : <FaQuestion />;
}

const Transaksionet = ({ onNavigate, currentPage }) => {
  const [transaksionet, setTransaksionet] = useState([]); 
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [filters, setFilters] = useState({ search: '', dateFrom: '', dateTo: '', kategoria: '', min: '', max: '' });
  const [form, setForm] = useState({ name: '', amount: '', category: '', type: '', date: '', description: '', method: '' });
  
  const handleNavigation = (page) => {
    setSidebarOpen(false);
    onNavigate(page);
  };

  // --- FIX: Wrap fetchTransactions in useCallback ---
  const fetchTransactions = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);
      const data = await getTransactions(filters);
      setTransaksionet(data.transactions || []);
      setSummary(data.summary || { totalIncome: 0, totalExpenses: 0, balance: 0 });
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError("Nuk mund të ngarkoheshin transaksionet.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]); // Add filters as a dependency

  // --- FIX: Add fetchTransactions to the dependency array ---
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amount || !form.category || !form.type || !form.date) {
        alert("Ju lutem plotësoni fushat e detyrueshme.");
        return;
    }
    
    try {
        if (editId) {
            await updateTransaction(editId, form);
        } else {
            await createTransaction(form);
        }

        setShowModal(false); 
        setEditId(null);
        setForm({ name: '', amount: '', category: '', type: '', date: '', description: '', method: '' });
        fetchTransactions();

    } catch (err) {
        console.error("Failed to save transaction:", err);
        alert(`Gabim: ${err.message}`);
    }
  }
  
  const handleDelete = async (id) => {
    if (window.confirm("A jeni i sigurt që doni ta fshini këtë transaksion?")) {
        try {
            await deleteTransaction(id);
            fetchTransactions();
        } catch (err) {
            console.error("Failed to delete transaction:", err);
            alert(`Gabim gjatë fshirjes: ${err.message}`);
        }
    }
  }
  
  const handleEdit = (t) => {
    setForm({
        name: t.name || '',
        amount: t.amount || '',
        category: t.category || '',
        type: t.type || '',
        date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
        description: t.description || '',
        method: t.method || '',
    });
    setEditId(t.id); 
    setShowModal(true);
  }

  const totalIncome = parseFloat(summary.totalIncome) || 0;
  const totalExpenses = parseFloat(summary.totalExpenses) || 0;
  const totalPie = totalIncome + totalExpenses;
  let percTeArdhura = 0;
  let percShpenzime = 0;

  if (totalPie > 0) {
    percTeArdhura = Math.round((totalIncome / totalPie) * 100);
    percShpenzime = 100 - percTeArdhura;
  }

  return (
    <div className="dashboard-container">
        {/* The rest of your JSX remains exactly the same */}
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo" onClick={() => setIsCollapsed(v => !v)}>
                    <img src={logo} alt="Logo" />
                </div>
                <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
                    <FaTimes />
                </button>
            </div>
            <nav className="sidebar-menu">
                <button type="button" onClick={() => handleNavigation('dashboard')}><FaHome /> <span>Ballina</span></button>
                <button type="button" className="active" ><FaExchangeAlt /> <span>Transaksionet</span></button>
                <button type="button" onClick={() => handleNavigation('qellimet')}><FaBullseye /> <span>Qëllimet</span></button>
                <button type="button" onClick={() => handleNavigation('aichat')}><FaRobot className="bot-icon" /> <span>AIChat</span></button>
                <button type="button" onClick={() => handleNavigation('settings')}><FaCog /> <span>Settings</span></button>
                <button type="button" onClick={() => handleNavigation('help')}><FaQuestionCircle /> <span>Ndihmë</span></button>
            </nav>
        </aside>

        <main className="dashboard-main">
            <div className="transaksionet-advanced-container">
                <div className="transaksionet-header-advanced">
                    <h2>Transaksionet e tua</h2>
                    <p className="transaksionet-desc">Këtu mund të shikosh të gjitha transaksionet, t'i filtroni dhe analizoni.</p>
                </div>
                
                <div className="transaksionet-balance-chart-row">
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start'}}>
                        <div className="transaksionet-action-buttons">
                            <button className="add-btn" onClick={() => setShowModal(true)}><FaPlus /> Shto transaksion</button>
                        </div>
                        <div className="transaksionet-balance-box">
                            Balanci aktual: <span style={{color: summary.balance >= 0 ? '#1de9b6' : '#ff8661'}}>{summary.balance.toFixed(2)}€</span>
                        </div>
                    </div>
                    <div className="transaksionet-pie-chart" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '28px', marginLeft: '60px'}}>
                        <div style={{
                            width: '140px', height: '140px', borderRadius: '50%',
                            background: `conic-gradient(#1de9b6 0% ${percTeArdhura}%, #ff8661 ${percTeArdhura}% 100%)`,
                            border: '8px solid #23243a', boxSizing: 'border-box', position: 'relative',
                        }}>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '140px'}}>
                            <span style={{color:'#1de9b6', fontWeight:'bold', fontSize:'1.4rem'}}>{percTeArdhura}% <span style={{color:'#b2dfdb', fontWeight:400, fontSize:'1.2rem'}}>Të ardhura</span></span>
                            <span style={{color:'#ff8661', fontWeight:'bold', fontSize:'1.4rem'}}>{percShpenzime}% <span style={{color:'#b2dfdb', fontWeight:400, fontSize:'1.2rem'}}>Shpenzime</span></span>
                        </div>
                    </div>
                </div>

                <div className="transaksionet-filters-advanced">
                    <input type="text" placeholder="Kërko emrin..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
                    <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
                    <span style={{color:'#888'}}>deri</span>
                    <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
                    <select value={filters.kategoria} onChange={e => setFilters(f => ({ ...f, kategoria: e.target.value }))}>
                        <option value="">Kategoria</option>
                        {kategoriaOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <input type="number" placeholder="Min €" value={filters.min} onChange={e => setFilters(f => ({ ...f, min: e.target.value }))} style={{width:80}} />
                    <input type="number" placeholder="Max €" value={filters.max} onChange={e => setFilters(f => ({ ...f, max: e.target.value }))} style={{width:80}} />
                </div>

                <div className="transaksionet-table-advanced-wrap">
                    {isLoading ? (
                        <p style={{textAlign: 'center', padding: '20px'}}>Duke ngarkuar transaksionet...</p>
                    ) : error ? (
                        <p style={{textAlign: 'center', padding: '20px', color: '#ff6b6b'}}>{error}</p>
                    ) : (
                        <table className="transaksionet-table-advanced">
                            <thead>
                                <tr>
                                    <th>Data</th><th>Emri</th><th>Kategoria</th><th>Lloji</th><th>Shuma (€)</th><th>Përshkrim</th><th>Metoda</th><th>Opsione</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaksionet.map(t => (
                                    <tr key={t.id} className="transaksion-row">
                                        <td>{new Date(t.date).toLocaleDateString('sq-AL')}</td>
                                        <td>{getIconForCategory(t.category)} {t.name}</td>
                                        <td>{t.category}</td>
                                        <td style={{color: t.type === 'income' ? '#1de9b6' : '#ff8661', fontWeight: 600}}>{t.type === 'income' ? 'Të ardhura' : 'Shpenzim'}</td>
                                        <td style={{color: t.type === 'income' ? '#1de9b6' : '#ff8661', fontWeight: 600}}>{t.type === 'income' ? '+' : '-'}{t.amount}€</td>
                                        <td>{t.description}</td>
                                        <td>{t.method}</td>
                                        <td>
                                            <button className="icon-btn" title="Edito" onClick={() => handleEdit(t)}><FaEdit /></button>
                                            <button className="icon-btn" title="Fshi" onClick={() => handleDelete(t.id)}><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-bg">
                    <div className="modal-content">
                        <h3>{editId ? 'Edito' : 'Shto'} transaksion</h3>
                        <form className="modal-form" onSubmit={handleSubmit}>
                            <input type="text" placeholder="Emri i transaksionit" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                            <input type="number" placeholder="Shuma" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                                <option value="">Kategoria</option>
                                {kategoriaOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} required>
                                <option value="">Lloji</option>
                                {llojiOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                            <textarea placeholder="Përshkrim shtesë (opsional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                            <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                                <option value="">Metoda e pagesës (opsionale)</option>
                                {metodaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:16}}>
                                <button type="button" onClick={() => {setShowModal(false);setEditId(null);setForm({ name: '', amount: '', category: '', type: '', date: '', description: '', method: '' });}} className="cancel-btn">Anulo</button>
                                <button type="submit" className="add-btn">{editId ? 'Ruaj' : 'Shto'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    </div>
  );
};

export default Transaksionet;