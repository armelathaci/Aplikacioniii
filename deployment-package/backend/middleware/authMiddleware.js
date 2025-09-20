// backend/middleware/authMiddleware.js

const ErrorHandler = require('./errorHandler');
const config = require('../utils/config');
// We need BaseRoutes to inherit the sendError method
const BaseRoutes = require('../routes/BaseRoutes'); 

class AuthMiddleware extends BaseRoutes {
    constructor(sessionManager, databaseManager) {
        super(); // Call the BaseRoutes constructor
        this.sessionManager = sessionManager;
        this.databaseManager = databaseManager;
    }

    /**
     * Middleware to require basic authentication.
     * It checks for a valid token and attaches the user to the request.
     * This function is now async to handle the async validateSession method.
     */
    async requireAuth(req, res, next) {
        try {
            const token = this.extractToken(req);
            if (!token) {
                // Using this.sendError inherited from BaseRoutes for consistency
                return this.sendError(res, 401, 'Authentication required');
            }

            // Await the session validation since it now checks the database
            const session = await this.sessionManager.validateSession(token);
            if (!session) {
                return this.sendError(res, 401, 'Token expired or invalid');
            }

            // Attach user object to the request
            req.user = {
                userId: session.userId,
                email: session.email,
                token: token
            };

            // Proceed to the next function in the chain (the actual route handler)
            next();

        } catch (error) {
            ErrorHandler.logError(error, req);
            return this.sendError(res, 500, 'Authentication failed');
        }
    }

    /**
     * Middleware to require admin privileges.
     * This should be used AFTER requireAuth.
     */
    requireAdmin(req, res, next) {
        // We call this.requireAuth and pass the admin check logic as the 'next' function
        this.requireAuth(req, res, async () => {
            try {
                const isAdmin = await this.checkAdminRole(req.user.userId);
                if (!isAdmin) {
                    return this.sendError(res, 403, 'Admin privileges required');
                }
                next(); // If admin, proceed to the actual route handler
            } catch (error) {
                ErrorHandler.logError(error, req);
                return this.sendError(res, 500, 'Authorization check failed');
            }
        });
    }
    
    /**
     * Middleware to require ownership of a resource.
     * Checks if the logged-in user's ID matches the target user ID in the request.
     */
    requireOwnership(req, res, next) {
        this.requireAuth(req, res, async () => {
            const targetUserId = req.params.userId || req.body.userId || req.query.userId;
            if (!targetUserId) {
                return this.sendError(res, 400, 'User ID required for ownership check');
            }

            if (req.user.userId !== targetUserId) {
                await this.databaseManager.logAuditEvent(
                    req.user.userId,
                    'UNAUTHORIZED_ACCESS',
                    `User attempted to access resource belonging to ${targetUserId}`,
                    req
                ).catch(err => console.error('Failed to log unauthorized access:', err));

                return this.sendError(res, 403, 'Access denied');
            }
            
            next();
        });
    }

    /**
     * Checks the database to see if a user has the 'admin' role.
     */
    async checkAdminRole(userId) {
        if (!this.databaseManager) {
            return false;
        }
        try {
            const user = await this.databaseManager.get(
                'SELECT role FROM users WHERE id = ? AND is_active = 1',
                [userId]
            );
            return user && user.role === 'admin';
        } catch (error) {
            console.error('Error checking admin role:', error);
            return false;
        }
    }

    /**
     * Extracts JWT token from request headers.
     */
    extractToken(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        if (req.headers['x-auth-token']) {
            return req.headers['x-auth-token'];
        }
        return null;
    }

    // The sendAuthError method is no longer needed here as we now inherit
    // the more generic sendError method from BaseRoutes.
}

module.exports = AuthMiddleware;