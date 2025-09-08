// backend/routes/authRoutes.js

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Validators = require('../utils/validators');
const ErrorHandler = require('../middleware/errorHandler');
const config = require('./utils/config');
const BaseRoutes = require('./BaseRoutes');

class AuthRoutes extends BaseRoutes {
    async handle(req, res, context) {
        const { sessionManager, databaseManager, parsedUrl, emailService } = context;
        const pathname = parsedUrl.pathname;
        const method = req.method.toUpperCase();

        try {
            if (method !== 'POST') {
                return this.sendError(res, 405, 'Method Not Allowed');
            }

            switch (pathname) {
                case '/auth/register':
                    return await this.register(req, res, { databaseManager });

                case '/auth/login':
                    return await this.login(req, res, { sessionManager, databaseManager });

                case '/auth/forgot-password':
                    return await this.forgotPassword(req, res, { databaseManager, emailService });

                case '/auth/reset-password':
                    return await this.resetPassword(req, res, { databaseManager });

                default:
                    return this.sendError(res, 404, 'Authentication endpoint not found');
            }
        } catch (error) {
            ErrorHandler.logError(error, req);
            return this.sendError(res, 500, 'Internal server error');
        }
    }

    async register(req, res, { databaseManager }) {
        try {
            const { email, password, fullName, day, month, year } = req.body;

            if (!email || !password || !fullName || !day || !month || !year) {
                return this.sendError(res, 400, 'All fields are required.');
            }

            const emailValidation = Validators.validateEmail(email);
            if (!emailValidation.valid) return this.sendError(res, 400, emailValidation.message);
            
            const passwordValidation = Validators.validatePassword(password);
            if (!passwordValidation.valid) return this.sendError(res, 400, passwordValidation.message);
            
            const nameValidation = Validators.validateName(fullName);
            if (!nameValidation.valid) return this.sendError(res, 400, nameValidation.message);
            
            const dobValidation = Validators.validateDateOfBirth(day, month, year);
            if (!dobValidation.valid) return this.sendError(res, 400, dobValidation.message);
            
            const existingUser = await databaseManager.get('SELECT id FROM users WHERE email = ?', [emailValidation.sanitized]);
            if (existingUser) {
                return this.sendError(res, 409, 'Email already registered');
            }

            const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);
            const userId = Validators.generateSecureId();

            await databaseManager.run(
                `INSERT INTO users (id, email, password_hash, full_name, date_of_birth) VALUES (?, ?, ?, ?, ?)`,
                [userId, emailValidation.sanitized, hashedPassword, nameValidation.sanitized, dobValidation.sanitized]
            );
            
            this.sendSuccess(res, 201, { message: 'Registration successful', userId });

        } catch (error) {
            ErrorHandler.logError(error, req);
            return this.sendError(res, 500, 'Registration failed');
        }
    }
    
    async login(req, res, { sessionManager, databaseManager }) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return this.sendError(res, 400, 'Email and password are required.');
            }
            
            const emailValidation = Validators.validateEmail(email);
            if (!emailValidation.valid) {
                return this.sendError(res, 400, emailValidation.message);
            }

            // Step 1: Find the user by their email address.
            const user = await databaseManager.get(
                'SELECT * FROM users WHERE email = ?',
                [emailValidation.sanitized]
            );

            // Step 2: **CRITICAL CHECK** - If no user is found, send a 401 Unauthorized error.
            if (!user) {
                return this.sendError(res, 401, 'Invalid email or password');
            }
            
            // Step 3: If the user was found, now compare the provided password with the hashed password in the database.
            const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

            // Step 4: **CRITICAL CHECK** - If the passwords do not match, send a 401 Unauthorized error.
            if (!isPasswordMatch) {
                return this.sendError(res, 401, 'Invalid email or password');
            }
            
            // Step 5: Check if the user's account is active.
            if (!user.is_active) {
                return this.sendError(res, 403, 'Account is deactivated');
            }

            // --- If all checks pass, the user is valid. Proceed with creating a session. ---
            await databaseManager.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
            const session = sessionManager.createSession(user.id, user.email);

            this.sendSuccess(res, 200, {
                message: 'Login successful',
                token: session.token,
                user: {
                    id: user.id,
                    fullName: user.full_name,
                    email: user.email,
                }
            });

        } catch (error) {
            ErrorHandler.logError(error, req);
            return this.sendError(res, 500, 'Login failed');
        }
    }

    async forgotPassword(req, res, { databaseManager, emailService }) {
        const { email } = req.body;
        if (!email) {
            return this.sendError(res, 400, 'Email is required.');
        }

        const user = await databaseManager.get('SELECT id FROM users WHERE email = ?', [email]);
        
        if (user) {
            const token = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry

            await databaseManager.run(
                'INSERT INTO password_resets (email, token_hash, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash), expires_at = VALUES(expires_at)',
                [email, tokenHash, expiresAt]
            );

            await emailService.sendPasswordResetLink(email, token);
        }

        return this.sendSuccess(res, 200, { message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    async resetPassword(req, res, { databaseManager }) {
        const { token, email, password } = req.body;

        const passwordValidation = Validators.validatePassword(password);
        if (!passwordValidation.valid) {
            return this.sendError(res, 400, passwordValidation.message);
        }

        const resetRecord = await databaseManager.get('SELECT * FROM password_resets WHERE email = ?', [email]);

        if (!resetRecord || new Date() > new Date(resetRecord.expires_at)) {
            return this.sendError(res, 400, 'Invalid or expired password reset token.');
        }

        const providedTokenHash = crypto.createHash('sha256').update(token).digest('hex');
        if (providedTokenHash !== resetRecord.token_hash) {
            return this.sendError(res, 400, 'Invalid or expired password reset token.');
        }

        const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);
        await databaseManager.run('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);

        await databaseManager.run('DELETE FROM password_resets WHERE email = ?', [email]);

        return this.sendSuccess(res, 200, { message: 'Password has been reset successfully.' });
    }
}

module.exports = new AuthRoutes();