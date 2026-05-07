const Redis = require('ioredis');

const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
});

client.on('connect', () => console.log('Redis connected successfully'));
client.on('error', (err) => console.error('Redis connection error:', err));

module.exports = client;
