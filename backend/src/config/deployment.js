const path = require('path');

// ── Load deployment.json ───────────────────────────────────────────────────────

let config;

try {
  config = require(path.resolve(__dirname, '../../config/deployment.json'));
} catch {
  throw new Error(
    '\nconfig/deployment.json not found.\n' +
    'Copy config/deployment.example.json to config/deployment.json and fill in your values.\n'
  );
}

// ── Validate required fields ───────────────────────────────────────────────────

const required = [
  ['superAdmin.username', config.superAdmin?.username],
  ['superAdmin.email',    config.superAdmin?.email],
  ['superAdmin.password', config.superAdmin?.password],
];

for (const [key, value] of required) {
  if (!value) throw new Error(`deployment.json: "${key}" is required and cannot be empty`);
}

if (!Array.isArray(config.subjects) || config.subjects.length === 0) {
  throw new Error('deployment.json: "subjects" must be a non-empty array');
}

module.exports = config;