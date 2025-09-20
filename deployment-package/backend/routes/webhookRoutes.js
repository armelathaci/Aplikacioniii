/**
 * Webhook Routes Handler
 * Handles webhook endpoints for external services
 */

const BaseRoutes = require('./BaseRoutes');

class WebhookRoutes extends BaseRoutes {
    async handle(req, res, context) {
        const { parsedUrl } = context;
        const method = req.method.toUpperCase();
        const pathname = parsedUrl.pathname;

        // Route: POST /webhook/finbot -> Handles Finbot webhook
        if (pathname === '/webhook/finbot' && method === 'POST') {
            return await this.handleFinbotWebhook(req, res, context);
        }

        // Route: POST /webhook/n8n -> Handles N8N webhook (legacy)
        if (pathname === '/webhook/n8n' && method === 'POST') {
            return await this.handleN8NWebhook(req, res, context);
        }

        return this.sendError(res, 404, 'Webhook endpoint not found');
    }

    async handleFinbotWebhook(req, res, context) {
        try {
            const { message, userId, timestamp } = req.body;

            console.log('Finbot webhook received:', {
                message,
                userId,
                timestamp,
                ip: req.socket.remoteAddress
            });

            // Process the webhook data here
            // For now, just log and return success
            const response = {
                status: 'success',
                message: 'Webhook received successfully',
                receivedAt: new Date().toISOString(),
                data: {
                    message,
                    userId,
                    timestamp
                }
            };

            this.sendSuccess(res, response);
        } catch (error) {
            console.error('Error processing Finbot webhook:', error);
            this.sendError(res, 500, 'Internal server error processing webhook');
        }
    }

    async handleN8NWebhook(req, res, context) {
        try {
            console.log('N8N webhook received:', {
                body: req.body,
                ip: req.socket.remoteAddress
            });

            // Process the N8N webhook data here
            const response = {
                status: 'success',
                message: 'N8N webhook received successfully',
                receivedAt: new Date().toISOString()
            };

            this.sendSuccess(res, response);
        } catch (error) {
            console.error('Error processing N8N webhook:', error);
            this.sendError(res, 500, 'Internal server error processing webhook');
        }
    }
}

module.exports = new WebhookRoutes();
