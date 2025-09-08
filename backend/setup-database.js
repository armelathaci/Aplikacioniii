/**
 * Database Setup Script for Elioti Financial Platform
 * Creates all necessary tables and initial data
 */

const mysql = require('mysql2/promise');
const path = require('path');

// Load .env file with explicit path
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug: Check if .env is loaded
console.log('🔧 Environment Variables Check:');
console.log('Current directory:', __dirname);
console.log('.env file path:', path.join(__dirname, '.env'));
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_FORCE:', process.env.DB_FORCE);

class DatabaseSetup {
    constructor() {
        // Use your database configuration directly
        this.config = {
            host: 'mainline.proxy.rlwy.net',
    port: 20325,
    name: 'railway',
    user: 'root', 
    password: 'IwBTmeJadUKdebodgvwkDPWyDmsGyKJQ'
        };
        
        // Debug: Print configuration (without password)
        console.log('🔧 Database Configuration:');
        console.log('Host:', this.config.host);
        console.log('Port:', this.config.port);
        console.log('User:', this.config.user);
        console.log('Database:', this.config.database);
        console.log('Password length:', this.config.password ? this.config.password.length : 0);
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection(this.config);
            console.log('✅ Connected to MySQL database');
        } catch (error) {
            console.error('❌ Failed to connect to database:', error.message);
            throw error;
        }
    }

    async createTables() {
        try {
            console.log('📋 Creating database tables...');

            // Users table
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(64) PRIMARY KEY,
                    email VARCHAR(254) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(100) NOT NULL,
                    date_of_birth DATE NOT NULL,
                    employment_status VARCHAR(50) DEFAULT 'i punësuar',
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Users table created');

            // User profiles table
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS user_profiles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(64) NOT NULL,
                    job_title VARCHAR(100),
                    monthly_salary DECIMAL(10,2),
                    savings_goal_percentage INT DEFAULT 20,
                    phone VARCHAR(20),
                    address TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ User profiles table created');

            // Transactions table
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id VARCHAR(64) PRIMARY KEY,
                    user_id VARCHAR(64) NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    type ENUM('income', 'expense') NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    description TEXT,
                    date DATE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ Transactions table created');

            // Goals table
await this.connection.execute(`
    CREATE TABLE IF NOT EXISTS goals (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        target_amount DECIMAL(12,2) NOT NULL,
        saved_amount DECIMAL(12,2) DEFAULT 0,
        category VARCHAR(100),
        target_date DATE,
        description TEXT, -- <-- THIS IS THE CRITICAL COLUMN
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`);
console.log('✅ Goals table created/updated');
            // Settings table
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS user_settings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(64) NOT NULL,
                    notifications BOOLEAN DEFAULT TRUE,
                    language VARCHAR(10) DEFAULT 'al',
                    currency VARCHAR(10) DEFAULT 'ALL',
                    timezone VARCHAR(50) DEFAULT 'Europe/Tirane',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ User settings table created');

            // AI Chat conversations table
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS ai_conversations (
                    id VARCHAR(64) PRIMARY KEY,
                    user_id VARCHAR(64) NOT NULL,
                    session_id VARCHAR(64) NOT NULL,
                    message TEXT NOT NULL,
                    response TEXT NOT NULL,
                    context VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ AI conversations table created');

            // Help tickets table
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS help_tickets (
                    id VARCHAR(64) PRIMARY KEY,
                    user_id VARCHAR(64) NOT NULL,
                    subject VARCHAR(200) NOT NULL,
                    message TEXT NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
                    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ Help tickets table created');

            // Audit logs table
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(64),
                    action VARCHAR(100) NOT NULL,
                    details JSON,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
                )
            `);
            console.log('✅ Audit logs table created');

            console.log('🎉 All tables created successfully!');

        } catch (error) {
            console.error('❌ Error creating tables:', error.message);
            throw error;
        }
    }

    async createIndexes() {
        try {
            console.log('📊 Creating database indexes...');

            // Indexes for better performance (MySQL doesn't support IF NOT EXISTS for indexes)
            try {
                await this.connection.execute('CREATE INDEX idx_users_email ON users(email)');
                console.log('✅ Index idx_users_email created');
            } catch (error) {
                if (error.message.includes('Duplicate key name')) {
                    console.log('ℹ️ Index idx_users_email already exists');
                } else {
                    throw error;
                }
            }

            try {
                await this.connection.execute('CREATE INDEX idx_transactions_user_date ON transactions(user_id, date)');
                console.log('✅ Index idx_transactions_user_date created');
            } catch (error) {
                if (error.message.includes('Duplicate key name')) {
                    console.log('ℹ️ Index idx_transactions_user_date already exists');
                } else {
                    throw error;
                }
            }

            try {
                await this.connection.execute('CREATE INDEX idx_transactions_type ON transactions(type)');
                console.log('✅ Index idx_transactions_type created');
            } catch (error) {
                if (error.message.includes('Duplicate key name')) {
                    console.log('ℹ️ Index idx_transactions_type already exists');
                } else {
                    throw error;
                }
            }

            try {
                await this.connection.execute('CREATE INDEX idx_goals_user ON goals(user_id)');
                console.log('✅ Index idx_goals_user created');
            } catch (error) {
                if (error.message.includes('Duplicate key name')) {
                    console.log('ℹ️ Index idx_goals_user already exists');
                } else {
                    throw error;
                }
            }

            try {
                await this.connection.execute('CREATE INDEX idx_audit_logs_user ON audit_logs(user_id)');
                console.log('✅ Index idx_audit_logs_user created');
            } catch (error) {
                if (error.message.includes('Duplicate key name')) {
                    console.log('ℹ️ Index idx_audit_logs_user already exists');
                } else {
                    throw error;
                }
            }

            try {
                await this.connection.execute('CREATE INDEX idx_audit_logs_created ON audit_logs(created_at)');
                console.log('✅ Index idx_audit_logs_created created');
            } catch (error) {
                if (error.message.includes('Duplicate key name')) {
                    console.log('ℹ️ Index idx_audit_logs_created already exists');
                } else {
                    throw error;
                }
            }

            console.log('✅ All indexes created successfully!');

        } catch (error) {
            console.error('❌ Error creating indexes:', error.message);
            throw error;
        }
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔌 Database connection closed');
        }
    }

    async run() {
        try {
            await this.connect();
            await this.createTables();
            await this.createIndexes();
            console.log('\n🎉 Database setup completed successfully!');
        } catch (error) {
            console.error('\n❌ Database setup failed:', error.message);
            process.exit(1);
        } finally {
            await this.close();
        }
    }
}

// Run the setup if this file is executed directly
if (require.main === module) {
    const setup = new DatabaseSetup();
    setup.run();
}

module.exports = DatabaseSetup;
