// backend/routes/transactionRoutes.js

const Validators = require('../utils/validators');
const ErrorHandler = require('../middleware/errorHandler');
const BaseRoutes = require('./BaseRoutes');

class TransactionRoutes extends BaseRoutes {
    async handle(req, res, context) {
        const { authMiddleware, parsedUrl } = context;

        authMiddleware.requireAuth(req, res, async () => {
            const pathname = parsedUrl.pathname;
            const method = req.method.toUpperCase();

            if (pathname === '/transaction/list' && method === 'GET') {
                return await this.getTransactions(req, res, context);
            }
            if (pathname === '/transaction/create' && method === 'POST') {
                return await this.createTransaction(req, res, context);
            }
            
            // --- THIS SECTION IS NOW FILLED IN ---
            if (pathname.startsWith('/transaction/update/') && (method === 'PUT' || method === 'PATCH')) {
                return await this.updateTransaction(req, res, context);
            }
            if (pathname.startsWith('/transaction/delete/') && method === 'DELETE') {
                return await this.deleteTransaction(req, res, context);
            }
            
            this.sendError(res, 404, 'Transaction endpoint not found');
        });
    }

    async getTransactions(req, res, { databaseManager }) {
        const userId = req.user.userId;
        try {
            const transactions = await databaseManager.all(
                `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC`,
                [userId]
            );
            
            const summary = await databaseManager.get(`
                SELECT 
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalIncome,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalExpenses
                FROM transactions 
                WHERE user_id = ?`, 
                [userId]
            );
            
            const balance = (summary.totalIncome || 0) - (summary.totalExpenses || 0);

            this.sendSuccess(res, 200, { 
                transactions,
                summary: {
                    totalIncome: summary.totalIncome || 0,
                    totalExpenses: summary.totalExpenses || 0,
                    balance: balance
                }
            });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to get transactions');
        }
    }

    async createTransaction(req, res, { databaseManager }) {
        try {
            const userId = req.user.userId;
            const { name, amount, type, category, description, date, method = null } = req.body;
            
            const validation = Validators.validateTransaction(amount, type, category, description);
            if (!validation.valid) {
                return this.sendError(res, 400, validation.message);
            }

            const sanitized = validation.sanitized;
            const transactionId = Validators.generateSecureId();

            await databaseManager.run(
                `INSERT INTO transactions (id, user_id, name, amount, type, category, description, date, method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [transactionId, userId, name, sanitized.amount, sanitized.type, sanitized.category, sanitized.description, date, method]
            );
            this.sendSuccess(res, 201, { message: 'Transaction created successfully', transactionId });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500,  'Failed to create transaction');
        }
    }
    
    async updateTransaction(req, res, { databaseManager, parsedUrl }) {
        try {
            const transactionId = parsedUrl.pathname.split('/')[3];
            const userId = req.user.userId;
            const { name, amount, type, category, description, date, method } = req.body;
            
            const result = await databaseManager.run(
                `UPDATE transactions SET name=?, amount=?, type=?, category=?, description=?, date=?, method=?, updated_at=CURRENT_TIMESTAMP
                 WHERE id = ? AND user_id = ?`,
                [name, parseFloat(amount), type, category, description, date, method, transactionId, userId]
            );

            if (result.affectedRows === 0) {
                return this.sendError(res, 404, 'Transaction not found or you do not have permission to edit it.');
            }
            this.sendSuccess(res, 200, { message: 'Transaction updated successfully' });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to update transaction');
        }
    }

    async deleteTransaction(req, res, { databaseManager, parsedUrl }) {
        try {
            const transactionId = parsedUrl.pathname.split('/')[3];
            const userId = req.user.userId;
            
            const result = await databaseManager.run(
                'DELETE FROM transactions WHERE id = ? AND user_id = ?',
                [transactionId, userId]
            );
            
            if (result.affectedRows === 0) {
                return this.sendError(res, 404, 'Transaction not found or you do not have permission to delete it.');
            }
            this.sendSuccess(res, 200, { message: 'Transaction deleted successfully' });
        } catch (error) {
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Failed to delete transaction');
        }
    }
}

module.exports = new TransactionRoutes();