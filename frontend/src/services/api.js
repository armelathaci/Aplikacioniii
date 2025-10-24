// frontend/src/services/api.js

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

// A helper function to manage all API requests
async function fetchApi(path, options = {}) {
  const finalHeaders = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    for (const key in options.headers) {
      finalHeaders[key] = options.headers[key];
    }
  }

  const token = localStorage.getItem('token');
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const fetchConfig = {};

  for (const key in options) {
    if (key !== 'headers') {
      fetchConfig[key] = options[key];
    }
  }

  fetchConfig.headers = finalHeaders;

  const response = await fetch(new URL(path, API_URL), fetchConfig);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed with status ${response.status}: ${errorText}`);
  }

  /*if (!response.ok) {
    return { content: "Faleminderit! Cila është pyetja e radhës?" };
  }*/
  

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return {};
  }
}

// --- Authentication Functions ---
export const login = (email, password) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const register = (userData) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const forgotPassword = (email) => fetchApi('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const resetPassword = (data) => fetchApi('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) });

// --- Dashboard Functions ---
export const getHomeDashboardData = () => fetchApi('/dashboard/home'); // /dashboard/home

// --- Transactions Functions ---
export const getTransactions = (filters = {}) => fetchApi('/transaction/list');
export const createTransaction = (transactionData) => fetchApi('/transaction/create', { method: 'POST', body: JSON.stringify(transactionData) });
export const updateTransaction = (transactionId, transactionData) => fetchApi(`/transaction/update/${transactionId}`, { method: 'PUT', body: JSON.stringify(transactionData) });
export const deleteTransaction = (transactionId) => fetchApi(`/transaction/delete/${transactionId}`, { method: 'DELETE' });

// --- Goals Functions ---
export const getGoals = () => fetchApi('/goal/list'); 
export const createGoal = (goalData) => fetchApi('/goal/create', { method: 'POST', body: JSON.stringify(goalData) });
export const updateGoal = (goalId, goalData) => fetchApi(`/goal/update/${goalId}`, { method: 'PUT', body: JSON.stringify(goalData) });
export const deleteGoal = (goalId) => fetchApi(`/goal/delete/${goalId}`, { method: 'DELETE' });

// --- Settings / User Profile Functions ---
export const getProfile = () => fetchApi('/user/profile');
export const updateProfile = (profileData) => fetchApi('/user/profile', { method: 'PUT', body: JSON.stringify(profileData) });
export const changePassword = (passwordData) => fetchApi('/user/password', { method: 'POST', body: JSON.stringify(passwordData) });
export const deleteAccount = () => fetchApi('/settings/delete-account', { method: 'DELETE' });

// --- Original Settings API Calls ---
export const getSettings = () => fetchApi('/settings/notifications');
export const updateSettings = (data) => fetchApi('/settings/notifications', { method: 'PUT', body: JSON.stringify(data) });

// --- AI Chat Functions ---
export const startAIChat = (topic = 'General') => fetchApi('/ai-chat/start', { method: 'POST', body: JSON.stringify({ topic }) });
export const sendMessageToAI = (conversationId, message) => fetchApi('/ai-chat/message', { method: 'POST', body: JSON.stringify({ conversationId, message }) });

// --- Finbot Webhook Functions ---

export async function sendMessageToFinbot(userMessage, userId) {
  try {
    const sessionId = Date.now();
    const response = await fetch("https://n8nlocal.me/webhook/n8n", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        message: userMessage,
        sessionId: sessionId,
        userId: userId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Merr tekstin dhe provo ta kthesh në JSON
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};  // nëse është bosh, kthe objekt bosh
    } catch (e) {
      data = { raw: text }; // nëse nuk është JSON valid, kthe raw tekstin
    }

    return data;
  } catch (error) {
    console.error("Error sending message to Finbot webhook:", error);
    throw error;
  }
}

// Legacy function for backward compatibility
export const sendToFinbotWebhook = async (userId, conversationId, message) => {
  try {
    const sessionId = Date.now();
    console.log('Sending message to Finbot webhook:', { message, sessionId, userId });
    
    const response = await fetch("https://n8nlocal.me/webhook/n8n", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        message: message,
        sessionId: sessionId,
        userId: userId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message to Finbot webhook:', error);
    throw error;
  }
};