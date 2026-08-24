require('dotenv').config();
const { startEmailWorker } = require('../services/email/emailWorker');

startEmailWorker();
