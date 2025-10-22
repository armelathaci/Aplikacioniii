// server.js

require('dotenv').config();

const http = require('http');
const url = require('url');



// Core modules
const config = require('./utils/config');
const ErrorHandler = require('./middleware/errorHandler');
const DatabaseManager = require('./services/databaseManager');
const SessionManager = require('./services/sessionManager');
const EmailService = require('./services/emailService');
const AuthMiddleware = require('./middleware/authMiddleware');
const RateLimiter = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const goalRoutes = require('./routes/goalRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const helpRoutes = require('./routes/helpRoutes');
const aiChatRoutes = require('./routes/aiChatRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
//const webhookRoutes = require('./routes/webhookRoutes');// profileRoutes is the only one that can be removed as its logic is fully in userRoutes
// const profileRoutes = require('./routes/profileRoutes'); // REMOVED


class EliotiServer {
    constructor() {
        // Correct initialization order
        this.databaseManager = new DatabaseManager();
        this.sessionManager = new SessionManager(this.databaseManager);
        this.emailService = EmailService;
        this.authMiddleware = new AuthMiddleware(this.sessionManager, this.databaseManager);
        this.rateLimiter = new RateLimiter();
        
        // Final, correct route mapping
        this.routes = {
            '/auth': authRoutes,
            '/user': userRoutes,
            '/transaction': transactionRoutes,
            '/goal': goalRoutes,
            '/settings': settingsRoutes, // <-- RE-ADDED
            '/help': helpRoutes,
            '/ai-chat': aiChatRoutes,
            '/dashboard': dashboardRoutes
            //'/webhook': webhookRoutes
        };
        
        this.server = null;
    }

    async initialize() {
        try {
            config.validate();
            await this.databaseManager.connect();
            this.server = http.createServer(this.handleRequest.bind(this));
            this.server.listen(config.server.port,  '0.0.0.0', () => {
                console.log(`🚀 Elioti server running on ${config.server.host}:${config.server.port}`);
                console.log(`🔧 Environment: ${config.server.environment}`);
            });
            this.setupGracefulShutdown();
        } catch (error) {
            console.error('❌ Failed to initialize server:', error);
            process.exit(1);
        }
    }

    async handleRequest(req, res) {
        try {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            const method = req.method.toUpperCase();

            this.setCORSHeaders(res);

            const clientIp = req.socket.remoteAddress;
            if (!this.rateLimiter.checkLimit(clientIp, pathname)) {
                // ... (rate limiter headers) ...
                return this.sendError(res, 429, 'Too many requests, please try again later.');
            }

            if (method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }

            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                await this.parseRequestBody(req);
            }

            const routeHandler = this.findRouteHandler(pathname);
            if (routeHandler) {
                // Pass all required services to the route handlers
                await routeHandler.handle(req, res, {
                    sessionManager: this.sessionManager,
                    authMiddleware: this.authMiddleware,
                    databaseManager: this.databaseManager,
                    emailService: this.emailService,
                    parsedUrl
                });
            } else {
                this.sendError(res, 404, 'Route not found');
            }
        } catch (error) {
            if (error.message === 'Invalid JSON in request body' || error.message === 'Request body too large') {
                return this.sendError(res, 400, error.message);
            }
            ErrorHandler.logError(error, req);
            this.sendError(res, 500, 'Internal server error');
        }
    }

    findRouteHandler(pathname) {
        for (const [prefix, handler] of Object.entries(this.routes)) {
            if (pathname.startsWith(prefix)) return handler;
        }
        return null;
    }

    async parseRequestBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
                if (body.length > 1e6) { // 1MB limit
                    req.destroy();
                    reject(new Error('Request body too large'));
                }
            });
            req.on('end', () => {
                try {
                    req.body = body ? JSON.parse(body) : {};
                    resolve();
                } catch (error) {
                    reject(new Error('Invalid JSON in request body'));
                }
            });
            req.on('error', reject);
        });
    }

    setCORSHeaders(res) {
        res.setHeader('Access-Control-Allow-Origin', config.cors.origin);
        res.setHeader('Access-Control-Allow-Methods', config.cors.methods.join(', '));
        res.setHeader('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));
        res.setHeader('Access-Control-Max-Age', '86400');
    }

    sendError(res, statusCode, message) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: { message, code: statusCode, timestamp: new Date().toISOString() }
        }));
    }

    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
            if (this.server) this.server.close(() => console.log('✅ HTTP server closed'));
            if (this.databaseManager) await this.databaseManager.disconnect();
            console.log('👋 Server shutdown complete');
            process.exit(0);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}

if (require.main === module) {
    const server = new EliotiServer();
    server.initialize();
}

module.exports = EliotiServer;