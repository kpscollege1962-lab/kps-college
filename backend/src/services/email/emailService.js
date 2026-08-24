const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars').default;
const path = require('path');
const appConfig = require('../../config/app');

const TEMPLATES_DIR = path.join(__dirname, '../../templates/email');

// ── Transporter ───────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Handlebars compile plugin ─────────────────────────────────────────────────

transporter.use(
  'compile',
  hbs({
    viewEngine: {
      extname: '.hbs',
      partialsDir: path.join(TEMPLATES_DIR, 'partials'),
      layoutsDir: path.join(TEMPLATES_DIR, 'layouts'),
      defaultLayout: 'base',
      helpers: {
        currentYear: () => new Date().getFullYear(),
      },
    },
    viewPath: path.join(TEMPLATES_DIR, 'transactional'),
    extName: '.hbs',
  })
);

// ── Public API ────────────────────────────────────────────────────────────────

const sendEmail = ({ to, subject, template, context }) =>
  transporter.sendMail({
    from: `"${appConfig.name}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    template,
    context: { ...context, appName: appConfig.name },
  });

module.exports = { sendEmail };
