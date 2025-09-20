

const Validators = require('../utils/validators');
const ErrorHandler = require('../middleware/errorHandler');
const BaseRoutes = require('./BaseRoutes');

class SettingsRoutes extends BaseRoutes {
    async handle(req, res, context) {
        const { authMiddleware, parsedUrl } = context;

        // All settings routes require a user to be logged in
        authMiddleware.requireAuth(req, res, async () => {
            const pathname = parsedUrl.pathname;
            const method = req.method.toUpperCase();

            // Settings routing logic
            if (pathname === '/settings/profile' && method === 'GET') {
                return await this.getProfileSettings(req, res, context);
            }
            if (pathname === '/settings/profile' && method === 'PUT') {
                return await this.updateProfileSettings(req, res, context);
            }
            if (pathname === '/settings/account' && method === 'GET') {
                return await this.getAccountSettings(req, res, context);
            }
            if (pathname === '/settings/account' && method === 'PUT') {
                return await this.updateAccountSettings(req, res, context);
            }
            if (pathname === '/settings/notifications' && method === 'GET') {
                return await this.getNotificationSettings(req, res, context);
            }
            if (pathname === '/settings/notifications' && method === 'PUT') {
                return await this.updateNotificationSettings(req, res, context);
            }
            if (pathname === '/settings/privacy' && method === 'GET') {
                return await this.getPrivacySettings(req, res, context);
            }
            if (pathname === '/settings/privacy' && method === 'PUT') {
                return await this.updatePrivacySettings(req, res, context);
            }
            if (pathname === '/settings/currency' && method === 'GET') {
                return await this.getCurrencySettings(req, res, context);
            }
            if (pathname === '/settings/currency' && method === 'PUT') {
                return await this.updateCurrencySettings(req, res, context);
            }
            if (pathname === '/settings/export' && method === 'POST') {
                return await this.exportUserData(req, res, context);
            }
            
            // --- THIS IS THE NEW ROUTE FOR CHANGING THE PASSWORD ---
            if (pathname === '/settings/password' && method === 'POST') {
                return await this.changePassword(req, res, context);
            }
            
            if (pathname === '/settings/delete-account' && method === 'DELETE') {
                return await this.deleteAccount(req, res, context);
            }
            
            this.sendError(res, 404, 'Settings endpoint not found');
        });
    }

    // --- GET PROFILE SETTINGS ---
    async getProfileSettings(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            
            const profile = await databaseManager.get(
                'SELECT id, username, email, first_name, last_name, phone, date_of_birth, profile_picture, bio, timezone FROM users WHERE id = ?',
                [userId]
            );

            if (!profile) {
                return this.sendError(res, 404, 'User profile not found');
            }

            this.sendSuccess(res, 200, { profile });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to retrieve profile settings');
        }
    }

    // --- UPDATE PROFILE SETTINGS ---
    async updateProfileSettings(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            const { firstName, lastName, phone, dateOfBirth, bio, timezone } = req.body;

            // Validation
            if (firstName && firstName.length > 50) {
                return this.sendError(res, 400, 'First name must be less than 50 characters');
            }
            if (lastName && lastName.length > 50) {
                return this.sendError(res, 400, 'Last name must be less than 50 characters');
            }
            if (bio && bio.length > 500) {
                return this.sendError(res, 400, 'Bio must be less than 500 characters');
            }

            // Update profile fields
            const updateFields = [];
            const updateValues = [];
            
            if (firstName !== undefined) {
                updateFields.push('first_name = ?');
                updateValues.push(firstName);
            }
            if (lastName !== undefined) {
                updateFields.push('last_name = ?');
                updateValues.push(lastName);
            }
            if (phone !== undefined) {
                updateFields.push('phone = ?');
                updateValues.push(phone);
            }
            if (dateOfBirth !== undefined) {
                updateFields.push('date_of_birth = ?');
                updateValues.push(dateOfBirth);
            }
            if (bio !== undefined) {
                updateFields.push('bio = ?');
                updateValues.push(bio);
            }
            if (timezone !== undefined) {
                updateFields.push('timezone = ?');
                updateValues.push(timezone);
            }

            if (updateFields.length === 0) {
                return this.sendError(res, 400, 'No valid fields to update');
            }

            updateValues.push(userId);
            const sql = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            
            const result = await databaseManager.run(sql, updateValues);

            if (result.affectedRows === 0) {
                return this.sendError(res, 404, 'Profile not found');
            }

            this.sendSuccess(res, 200, { message: 'Profile settings updated successfully' });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to update profile settings');
        }
    }

    // --- GET ACCOUNT SETTINGS ---
    async getAccountSettings(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            
            const account = await databaseManager.get(
                'SELECT id, username, email, two_factor_enabled, last_login, account_status, created_at FROM users WHERE id = ?',
                [userId]
            );

            if (!account) {
                return this.sendError(res, 404, 'Account not found');
            }

            // Remove sensitive information
            delete account.email; // Don't expose full email in response
            
            this.sendSuccess(res, 200, { account });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to retrieve account settings');
        }
    }

    // --- UPDATE ACCOUNT SETTINGS ---
    async updateAccountSettings(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            const { username, twoFactorEnabled } = req.body;

            // Validation
            if (username && (username.length < 3 || username.length > 30)) {
                return this.sendError(res, 400, 'Username must be between 3 and 30 characters');
            }

            // Check if username is already taken
            if (username) {
                const existingUser = await databaseManager.get(
                    'SELECT id FROM users WHERE username = ? AND id != ?',
                    [username, userId]
                );
                if (existingUser) {
                    return this.sendError(res, 409, 'Username is already taken');
                }
            }

            const updateFields = [];
            const updateValues = [];
            
            if (username !== undefined) {
                updateFields.push('username = ?');
                updateValues.push(username);
            }
            if (twoFactorEnabled !== undefined) {
                updateFields.push('two_factor_enabled = ?');
                updateValues.push(twoFactorEnabled ? 1 : 0);
            }

            if (updateFields.length === 0) {
                return this.sendError(res, 400, 'No valid fields to update');
            }

            updateValues.push(userId);
            const sql = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            
            const result = await databaseManager.run(sql, updateValues);

            if (result.affectedRows === 0) {
                return this.sendError(res, 404, 'Account not found');
            }

            this.sendSuccess(res, 200, { message: 'Account settings updated successfully' });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to update account settings');
        }
    }

    // --- NEW METHOD for the "Change Password" MODAL ---
    async changePassword(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            if (newPassword !== confirmPassword) {
                return this.sendError(res, 400, 'New passwords do not match.');
            }
            
            const passwordValidation = Validators.validatePassword(newPassword);
            if (!passwordValidation.valid) {
                return this.sendError(res, 400, passwordValidation.message);
            }

            const user = await databaseManager.get('SELECT password_hash FROM users WHERE id = ?', [userId]);
            if (!user) {
                return this.sendError(res, 404, 'User not found.');
            }

            const isMatch = await require('bcrypt').compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return this.sendError(res, 401, 'Your current password is not correct.');
            }

            const newHashedPassword = await require('bcrypt').hash(newPassword, require('../utils/config').security.bcryptRounds);
            await databaseManager.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHashedPassword, userId]);

            this.sendSuccess(res, 200, { message: 'Password changed successfully.' });

        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to change password.');
        }
    }

    // --- GET NOTIFICATION SETTINGS ---
    async getNotificationSettings(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            
            const settings = await databaseManager.get(
                'SELECT email_notifications, push_notifications, sms_notifications, transaction_alerts, goal_reminders, weekly_reports, marketing_emails FROM user_settings WHERE user_id = ?',
                [userId]
            );

            if (!settings) {
                const defaultSettings = {
                    email_notifications: 1, push_notifications: 1, sms_notifications: 0,
                    transaction_alerts: 1, goal_reminders: 1, weekly_reports: 1, marketing_emails: 0
                };
                await databaseManager.run(
                    'INSERT INTO user_settings (user_id, email_notifications, push_notifications, sms_notifications, transaction_alerts, goal_reminders, weekly_reports, marketing_emails) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [userId, ...Object.values(defaultSettings)]
                );
                return this.sendSuccess(res, 200, { settings: defaultSettings });
            }

            this.sendSuccess(res, 200, { settings });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to retrieve notification settings');
        }
    }

    // --- UPDATE NOTIFICATION SETTINGS ---
    async updateNotificationSettings(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            const { emailNotifications, pushNotifications, smsNotifications, transactionAlerts, goalReminders, weeklyReports, marketingEmails } = req.body;
            const updates = [];
            const values = [];
            
            if(emailNotifications !== undefined) { updates.push('email_notifications = ?'); values.push(emailNotifications ? 1:0); }
            if(pushNotifications !== undefined) { updates.push('push_notifications = ?'); values.push(pushNotifications ? 1:0); }
            if(smsNotifications !== undefined) { updates.push('sms_notifications = ?'); values.push(smsNotifications ? 1:0); }
            if(transactionAlerts !== undefined) { updates.push('transaction_alerts = ?'); values.push(transactionAlerts ? 1:0); }
            if(goalReminders !== undefined) { updates.push('goal_reminders = ?'); values.push(goalReminders ? 1:0); }
            if(weeklyReports !== undefined) { updates.push('weekly_reports = ?'); values.push(weeklyReports ? 1:0); }
            if(marketingEmails !== undefined) { updates.push('marketing_emails = ?'); values.push(marketingEmails ? 1:0); }

            if (updates.length === 0) return this.sendError(res, 400, 'No valid fields to update');
            
            values.push(userId);
            const sql = `UPDATE user_settings SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
            await databaseManager.run(sql, values);

            this.sendSuccess(res, 200, { message: 'Notification settings updated successfully' });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to update notification settings');
        }
    }

        // --- GET PRIVACY SETTINGS ---
        async getPrivacySettings(req, res, context) {
            // This function is now a pointer to the main settings function.
            return await this.getAllUserSettings(req, res, context);
        }
    
        // --- UPDATE PRIVACY SETTINGS ---
        async updatePrivacySettings(req, res, context) {
            // This function is now a pointer to the main settings function.
            return await this.updateUserSettings(req, res, context);
        }
    
        // --- GET CURRENCY SETTINGS ---
        async getCurrencySettings(req, res, context) {
            // This function is now a pointer to the main settings function.
            return await this.getAllUserSettings(req, res, context);
        }
    
        // --- UPDATE CURRENCY SETTINGS ---
        async updateCurrencySettings(req, res, context) {
            // This function is now a pointer to the main settings function.
            return await this.updateUserSettings(req, res, context);
        }

    // --- EXPORT USER DATA ---
    // --- EXPORT USER DATA ---
async exportUserData(req, res, { databaseManager }) {
    try {
        const userId = req.user.userId;
        const userData = await this.gatherUserData(databaseManager, userId);
        
        // Set headers to tell the browser to download the file
        res.setHeader('Content-disposition', `attachment; filename=ruajmencur_data_${userId}.json`);
        res.setHeader('Content-type', 'application/json');

        // Send the JSON data as the response
        res.writeHead(200);
        res.end(JSON.stringify(userData, null, 2)); 

    } catch (error) {
        ErrorHandler.logError(error, req);
        this.sendError(res, 500, 'Failed to export user data.');
    }
}

    // --- DELETE ACCOUNT ---
    // --- THIS IS THE CORRECTED FUNCTION ---
async deleteAccount(req, res, { databaseManager, sessionManager }) { // <<< THE FIX IS HERE
    try {
        const userId = req.user.userId;

        // This will delete the user and all their related data
        await databaseManager.run('DELETE FROM users WHERE id = ?', [userId]);

        // This will now work correctly to invalidate the user's session token
        if (sessionManager && req.user.token) {
            await sessionManager.destroySession(req.user.token);
        }

        this.sendSuccess(res, 200, { message: 'Account deleted successfully.' });

    } catch (error) {
        ErrorHandler.logError(error, req);
        this.sendError(res, 500, 'Failed to delete account.');
    }
}

    // --- HELPER FUNCTION TO GATHER USER DATA ---
    // --- HELPER FUNCTION TO GATHER USER DATA ---
async gatherUserData(databaseManager, userId) {
    try {
        // Run all database queries at the same time for better performance
        const [
            userProfile,
            transactions,
            goals,
            settings
        ] = await Promise.all([
            databaseManager.get(`
                SELECT u.email, u.full_name, u.date_of_birth, u.employment_status, up.job_title, up.monthly_salary
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE u.id = ?
            `, [userId]),
            databaseManager.all('SELECT date, type, category, amount, description, method FROM transactions WHERE user_id = ? ORDER BY date ASC', [userId]),
            databaseManager.all('SELECT name, category, target_amount, saved_amount, target_date, description FROM goals WHERE user_id = ?', [userId]),
            databaseManager.get('SELECT theme, currency, language, timezone FROM user_settings WHERE user_id = ?', [userId])
        ]);

        // Combine all the data into a single object
        const userData = {
            profile: userProfile || {},
            settings: settings || {},
            financials: {
                goals: goals || [],
                transactions: transactions || []
            },
            export_date: new Date().toISOString()
        };

        return userData;

    } catch (error) {
        console.error(`Error gathering data for user ${userId}:`, error);
        throw new Error('Failed to gather user data.');
    }
}

    // --- HELPER FUNCTIONS ---
    sendSuccess(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...data }));
    }

    sendError(res, statusCode, message) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: { message, code: statusCode } }));
    }
}

module.exports = new SettingsRoutes();