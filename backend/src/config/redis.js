const { Redis } = require('ioredis');

/**
 * Creates a dedicated IORedis connection.
 * BullMQ requires each Queue/Worker to have its own connection instance,
 * so always call this as a factory — never share one connection between them.
 *
 * maxRetriesPerRequest: null is mandatory for BullMQ.
 */
const createRedisConnection = () =>
  new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
    ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
  });

module.exports = { createRedisConnection };
