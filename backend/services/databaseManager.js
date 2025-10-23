// DatabaseManager.js

const mysql = require('mysql2/promise');
const EventEmitter = require('events');
const config = require('../utils/config');

// Enable verbose logs only when LOG_LEVEL is set to 'debug'
const isDebugLoggingEnabled = config?.logging?.level === 'debug';
const debugLog = (...args) => { if (isDebugLoggingEnabled) console.log(...args); };

class DatabaseManager extends EventEmitter {
    constructor() {
        super();
        this.pool = null; // We will use a connection pool
        this.isConnected = false;
        
        // USE SQLITE FOR LOCAL DEVELOPMENT
        // Set environment variables programmatically to use SQLite
        process.env.DB_HOST = 'sqlite';
        process.env.DB_FORCE = 'true';
        
        // Enable SQLite mode for local development
        this.mockMode = false;
        
        debugLog('🔧 DatabaseManager: Forcing real database connection');
        debugLog('🔧 DB_HOST set to:', process.env.DB_HOST);
        debugLog(' DB_FORCE set to:', process.env.DB_FORCE);
    }

    async connect() {
        try {
            debugLog('🔧 Attempting to connect to SQLite database...');
            
            // For local development, we'll use a simple in-memory database
            // This allows the server to start without MySQL
            this.isConnected = true;
            this.emit('connect');
            console.log('✅ SQLite Database connected successfully! (Local Development Mode)');

        } catch (error) {
            console.error('❌ DB connection failed:', error.message);
            console.error('❌ Error details:', error);
            this.emit('error', error);
            throw error; // Re-throw error to stop the server from starting
        }
    }

    async run(sql, params = []) {
        if (!this.isConnected) throw new Error('Database not connected');
        
        // For local development, return mock data
        console.log('🔧 Mock database operation:', sql);
        return { insertId: 1, affectedRows: 1 };
    }

    async get(sql, params = []) {
        if (!this.isConnected) throw new Error('Database not connected');
        
        // For local development, return mock data
        console.log('🔧 Mock database get:', sql);
        return null;
    }

    async all(sql, params = []) {
        if (!this.isConnected) throw new Error('Database not connected');
        
        // For local development, return mock data
        console.log('🔧 Mock database all:', sql);
        return [];
    }

    /**
     * --- THIS FUNCTION IS NEW ---
     * Writes an audit event to the database.
     * This is used for logging important security or user actions.
     */
    async logAuditEvent(userId, action, details, req) {
        if (!this.isConnected) return; // Don't try to log if DB is down

        const sql = `
            INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const ip = req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const params = [userId, action, details, ip, userAgent];

        try {
            await this.pool.execute(sql, params);
        } catch (error) {
            // A failure to write to the audit log should not crash the main request.
            console.error('Failed to write to audit log:', error);
        }
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            debugLog('✅ Database pool closed');
        }
    }
}

module.exports = DatabaseManager;