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
        
        // FORCE REAL DATABASE CONNECTION
        // Set environment variables programmatically to disable mock mode
        process.env.DB_HOST = 'localhost';
        process.env.DB_FORCE = 'true';
        
        // Disable mock mode completely
        this.mockMode = false;
        
        debugLog('🔧 DatabaseManager: Forcing real database connection');
        debugLog('🔧 DB_HOST set to:', process.env.DB_HOST);
        debugLog(' DB_FORCE set to:', process.env.DB_FORCE);
    }

    async connect() {
        try {
            debugLog('🔧 Attempting to connect to MySQL database...');
            debugLog('🔧 Host:', config.database.host);
            debugLog('🔧 User:', config.database.user);
            debugLog(' Database:', config.database.name);
            debugLog('🔧 Port:', config.database.port);

            // Create a connection pool instead of a single connection
            this.pool = mysql.createPool({
                host: config.database.host,
                user: config.database.user,
                password: config.database.password,
                database: config.database.name,
                port: config.database.port,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });

            // Test the connection
            const connection = await this.pool.getConnection();
            connection.release(); // Release the connection back to the pool

            this.isConnected = true;
            this.emit('connect');
            console.log('✅ MySQL Database connected successfully!');

        } catch (error) {
            console.error('❌ DB connection failed:', error.message);
            console.error('❌ Error details:', error);
            this.emit('error', error);
            throw error; // Re-throw error to stop the server from starting
        }
    }

    async run(sql, params = []) {
        if (!this.isConnected) throw new Error('Database not connected');
        
        const [result] = await this.pool.execute(sql, params);
        return result;
    }

    async get(sql, params = []) {
        if (!this.isConnected) throw new Error('Database not connected');
        
        const [rows] = await this.pool.execute(sql, params);
        return rows[0] || null;
    }

    async all(sql, params = []) {
        if (!this.isConnected) throw new Error('Database not connected');
        
        const [rows] = await this.pool.execute(sql, params);
        return rows;
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