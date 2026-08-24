const { Worker } = require('bullmq');
const { createRedisConnection } = require('../../config/redis');
const { sendEmail } = require('./emailService');

const EMAIL_QUEUE_NAME = 'email';

/**
 * Creates and starts the BullMQ email worker.
 * @returns {Worker}
 */
const startEmailWorker = () => {
  const worker = new Worker(
    EMAIL_QUEUE_NAME,
    async (job) => {
      const { to, subject, template, context } = job.data;
      await sendEmail({ to, subject, template, context });
    },
    {
      connection: createRedisConnection(),
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`[EmailWorker] Job ${job.id} (${job.data.template} → ${job.data.to}) completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(
      `[EmailWorker] Job ${job?.id} (${job?.data?.template}) failed [attempt ${job?.attemptsMade}]:`,
      err.message
    );
  });

  worker.on('error', (err) => {
    console.error('[EmailWorker] Worker error:', err);
  });

  console.log('[EmailWorker] Email worker started');
  return worker;
};

module.exports = { startEmailWorker };
