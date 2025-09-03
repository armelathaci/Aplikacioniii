// backend/routes/BaseRoutes.js

class BaseRoutes {
    sendSuccess(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            ...data,
            timestamp: new Date().toISOString() 
        }));
    }

    sendError(res, statusCode, message) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: {
                message: message,
                code: statusCode,
                timestamp: new Date().toISOString()
            }
        }));
    }
}

module.exports = BaseRoutes;