

import React, { useState, useRef, useEffect } from 'react';
import { FaBars, FaTimes, FaHome, FaExchangeAlt, FaBullseye, FaRobot, FaCog, FaQuestionCircle } from 'react-icons/fa';
import './AIChat.css';
import logo from '../../img/logo1.png';
import { startAIChat, sendMessageToAI, sendMessageToFinbot } from '../../services/api';

const AIChat = ({onNavigate, user }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) setIsCollapsed(savedCollapsed === 'true');

    const initializeChat = async () => {
        try {
            const data = await startAIChat(`Chat for ${user.email}`);
            setConversationId(data.conversationId);
        } catch (error) {
            console.error("Could not start AI chat session:", error);
        }
    };
    if(user?.email) initializeChat();
  }, [user]);

  const messagesEndRef = useRef(null);
  
  const avatars = {
    user: { src: '/img/user.icon.png', alt: 'Përdoruesi', fallback: '👤' },
    ai: { src: null, alt: 'AI Asistent', fallback: '🤖' }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to Finbot webhook
      try {
        const finbotResponse = await sendMessageToFinbot(currentInput);
        if (finbotResponse.error) {
          console.warn('Finbot webhook failed:', finbotResponse.message);
        } else {
          console.log('Finbot webhook success:', finbotResponse);
        }
      } catch (webhookError) {
        console.warn('Finbot webhook failed, but continuing with AI chat:', webhookError);
        // Continue with normal AI chat even if webhook fails
      }

      const data = await sendMessageToAI(conversationId, currentInput);
      
      const aiMessage = {
        id: data.aiResponse.id,
        text: data.aiResponse.content,
        sender: 'ai',
        timestamp: new Date(data.aiResponse.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Për momentin nuk mund të lidhem me asistentin. Provoni më vonë.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- NEW: A function to handle navigation clicks ---
  const handleNavigation = (page) => {
    setSidebarOpen(false); // Close the sidebar
    onNavigate(page);     // Navigate to the new page
  };

  return (
    <div className="dashboard-container">
      <button className="hamburger-menu-btn" onClick={() => setSidebarOpen(true)}>
        <FaBars />
      </button>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => setIsCollapsed(v => !v)}>
            <img src={logo} alt="Logo" />
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>
        {/* --- MODIFIED: onClick now calls handleNavigation and "Dil" is gone --- */}
        <nav className="sidebar-menu">
          <button type="button" onClick={() => handleNavigation('dashboard')}><FaHome /> <span>Ballina</span></button>
          <button type="button" onClick={() => handleNavigation('transaksionet')}><FaExchangeAlt /> <span>Transaksionet</span></button>
          <button type="button" onClick={() => handleNavigation('qellimet')}><FaBullseye /> <span>Qëllimet</span></button>
          <button type="button" className="active"><FaRobot className="bot-icon" /> <span>AIChat</span></button>
          <button type="button" onClick={() => handleNavigation('settings')}><FaCog /> <span>Settings</span></button>
          <button type="button" onClick={() => handleNavigation('help')}><FaQuestionCircle /> <span>Ndihmë</span></button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="main-content-center">
          {/* Header Section */}
          <div className="ai-chat-header-section">
            <div className="ai-chat-header">
              <div>
                <h1>FinBot</h1>
                <p className="ai-chat-subtitle">Bisedoni me AI-në për pyetje financiare</p>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="ai-chat-content">
            {/* Messages Container */}
            <div className="messages-container">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <div className="welcome-icon">🤖</div>
                  <h3>Mirë se vini në Asistentin Financiar AI!</h3>
                  <p>Unë jam këtu për t'ju ndihmuar me pyetjet tuaja financiare.</p>
                  <p>Shkruani pyetjen tuaj dhe do të merrni përgjigje menjëherë.</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                >
                  <div className="message-avatar">
                    {message.sender === 'user' ? (
                      <>
                        <img 
                          src={avatars.user.src}
                          alt={avatars.user.alt}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className="avatar-fallback">{avatars.user.fallback}</span>
                      </>
                    ) : (
                      <span className="avatar-fallback">{avatars.ai.fallback}</span>
                    )}
                  </div>
                  
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    <div className="message-timestamp">{message.timestamp}</div>
                  </div>
                </div>
              ))}
              
              {/* Loading Animation */}
              {isLoading && (
                <div className="message ai-message">
                  <div className="message-avatar">
                    <span className="avatar-fallback">{avatars.ai.fallback}</span>
                  </div>
                  <div className="message-content">
                    <div className="loading-animation">
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="loading-text">...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>



            {/* Input Bar */}
            <div className="input-container">
              <div className="input-wrapper">
                <textarea
                  className="message-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Shkruani pyetjen tuaj këtu..."
                  rows="1"
                  disabled={isLoading}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        
      </main>
    </div>
  );
};

export default AIChat; 