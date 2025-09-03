/**
 * JWT-based Session Manager for secure token handling
 * Implements JWT tokens with proper expiration and blacklisting
 * USES the standard 'jsonwebtoken' library for security.
 */

const crypto = require('crypto');
const config = require('../utils/config');
const jwt = require('jsonwebtoken'); // Use the standard library

class SessionManager {
    // --- CHANGE 1: Accept the databaseManager in the constructor ---
    constructor(databaseManager) {
        this.sessionTimeout = config.security.sessionTimeout;
        this.jwtSecret = config.security.jwtSecret;
        this.databaseManager = databaseManager; // Store the database manager instance

        // In-memory blacklist for revoked tokens (use Redis in production)
        this.blacklistedTokens = new Set();

        // Cleanup blacklisted tokens every hour
        setInterval(() => this.cleanupBlacklistedTokens(), 3600000);
    }

    /**
     * Create a JWT token for user session
     */
    createSession(userId, email, additionalData = {}) {
        const payload = {
            userId,
            email,
            ...additionalData
        };

        const token = jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.sessionTimeout / 1000, // library expects seconds
            algorithm: 'HS256'
        });

        const decoded = jwt.decode(token);

        return {
            token,
            expiresAt: new Date(decoded.exp * 1000),
            userId,
            email
        };
    }

    /**
     * Validate and decode JWT token
     */
    // --- CHANGE 2: Make the method async and add the database check ---
    async validateSession(token) {
        try {
            // Check in-memory blacklist first for speed
            if (this.blacklistedTokens.has(token)) {
                return null;
            }

            // NEW: Check the persistent blacklist in the database
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const isBlacklistedInDB = await this.databaseManager.get(
                'SELECT token_hash FROM blacklisted_tokens WHERE token_hash = ?',
                [tokenHash]
            );
            if (isBlacklistedInDB) {
                return null; // Token is blacklisted in the database
            }

            // Verify and decode token using the library
            const payload = jwt.verify(token, this.jwtSecret, { algorithms: ['HS256'] });

            return {
                userId: payload.userId,
                email: payload.email,
                createdAt: new Date(payload.iat * 1000),
                expiresAt: new Date(payload.exp * 1000)
            };

        } catch (error) {
            // This will catch expired tokens, invalid signatures, etc.
            return null;
        }
    }

    /**
     * Revoke (blacklist) a token
     */
    // --- CHANGE 3: Make the method async and add the database insert ---
    async destroySession(token) {
        // Add to the fast in-memory blacklist
        this.blacklistedTokens.add(token);

        try {
            // Also add to the persistent database blacklist
            const payload = jwt.decode(token);
            if (payload && payload.exp) {
                const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
                const expiresAt = new Date(payload.exp * 1000);
                
                await this.databaseManager.run(
                    'INSERT INTO blacklisted_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)',
                    [tokenHash, payload.userId, expiresAt]
                );
            }
        } catch (error) {
            // A failure to write to the blacklist should not crash the main request.
            console.error('Failed to write token to database blacklist:', error);
        }
    }

    /**
     * Refresh a token (create new one with extended expiration)
     */
    refreshSession(token) {
        try {
            // Verify the token but ignore if it's expired for the refresh logic
            const payload = jwt.verify(token, this.jwtSecret, { ignoreExpiration: true });
            
            // Create a brand new token
            return this.createSession(payload.userId, payload.email);

        } catch (error) {
            // If verification fails for any other reason (e.g., bad signature), throw error
            throw new Error('Cannot refresh invalid token');
        }
    }

    /**
     * Clean up expired blacklisted tokens
     */
    async cleanupBlacklistedTokens() {
        // Clear the fast in-memory set
        this.blacklistedTokens.clear();
        console.log('Cleaned up in-memory token blacklist.');

        // NEW: Clean up expired tokens from the database
        try {
            await this.databaseManager.run(
                'DELETE FROM blacklisted_tokens WHERE expires_at < NOW()'
            );
            console.log('Cleaned up expired tokens from database blacklist.');
        } catch (error) {
            console.error('Failed to clean up database token blacklist:', error);
        }
    }
    
    /**
     * Validate token format without verifying signature
     */
    isValidTokenFormat(token) {
        try {
            if (!token || typeof token !== 'string') return false;
            const parts = token.split('.');
            return parts.length === 3;
        } catch (error) {
            return false;
        }
    }
}

module.exports = SessionManager;