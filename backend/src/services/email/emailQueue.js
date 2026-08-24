const { Queue } = require('bullmq');
const { createRedisConnection } = require('../../config/redis');

const EMAIL_QUEUE_NAME = 'email';

const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5s → 10s → 20s
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

/**
 * Adds an email job to the queue.
 *
 * @param {object} payload
 * @param {string} payload.to        - recipient address
 * @param {string} payload.subject   - email subject
 * @param {string} payload.template  - template name (e.g. 'forgot-password')
 * @param {object} payload.context   - template variables
 * @param {object} [jobOptions]      - optional BullMQ job options override
 */
const addEmailJob = (payload, jobOptions = {}) =>
  emailQueue.add('send-email', payload, jobOptions);

module.exports = { emailQueue, addEmailJob };
