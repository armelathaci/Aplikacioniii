#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Test webhook locally first
function testLocalWebhook() {
    const data = JSON.stringify({
        message: "Test message from local test",
        userId: "test-user-123",
        timestamp: new Date().toISOString()
    });

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/webhook/finbot',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    console.log('🧪 Testing local webhook...');
    console.log('URL: http://localhost:3001/webhook/finbot');
    console.log('Data:', data);

    const req = http.request(options, (res) => {
        console.log(`\n📊 Local Response Status: ${res.statusCode}`);
        console.log('📋 Local Response Headers:', res.headers);

        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            console.log('📄 Local Response Body:', responseData);
            if (res.statusCode === 200) {
                console.log('✅ Local webhook test PASSED');
            } else {
                console.log('❌ Local webhook test FAILED');
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Local webhook test ERROR:', error.message);
    });

    req.write(data);
    req.end();
}

// Test production webhook
function testProductionWebhook() {
    const data = JSON.stringify({
        message: "Test message from production test",
        userId: "test-user-123",
        timestamp: new Date().toISOString()
    });

    const options = {
        hostname: 'ruajmencur.me',
        port: 443,
        path: '/webhook/finbot',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    console.log('\n🌐 Testing production webhook...');
    console.log('URL: https://ruajmencur.me/webhook/finbot');
    console.log('Data:', data);

    const req = https.request(options, (res) => {
        console.log(`\n📊 Production Response Status: ${res.statusCode}`);
        console.log('📋 Production Response Headers:', res.headers);

        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            console.log('📄 Production Response Body:', responseData);
            if (res.statusCode === 200) {
                console.log('✅ Production webhook test PASSED');
            } else {
                console.log('❌ Production webhook test FAILED');
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Production webhook test ERROR:', error.message);
    });

    req.write(data);
    req.end();
}

// Run tests
console.log('🚀 Starting webhook tests...\n');
testLocalWebhook();

// Wait a bit then test production
setTimeout(() => {
    testProductionWebhook();
}, 2000);
