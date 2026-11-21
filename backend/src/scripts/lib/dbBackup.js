// Shared by the migration scripts: full mysqldump of the database into backend/backups/
// (git-ignored) before anything changes. Credentials come from backend/.env; the password goes
// to mysqldump through MYSQL_PWD only. mysqldump is found on PATH, in the usual Windows install
// folders (MySQL, MariaDB, XAMPP, WAMP, Laragon), or at MYSQLDUMP_PATH from .env.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const BACKUP_DIR = path.join(__dirname, '../../../backups');

// mysqldump on PATH, or in a usual Windows install folder, or MYSQLDUMP_PATH from .env.
const findMysqldump = () => {
  if (process.env.MYSQLDUMP_PATH) return process.env.MYSQLDUMP_PATH;
  const onPath = spawnSync('mysqldump', ['--version'], { encoding: 'utf8' });
  if (!onPath.error && onPath.status === 0) return 'mysqldump';
  if (process.platform !== 'win32') return null;

  const exe = 'mysqldump.exe';
  const binsUnder = (root) => {
    try {
      return fs.readdirSync(root).map((d) => path.join(root, d, 'bin'));
    } catch { return []; }
  };
  const programFiles = [process.env.ProgramFiles, process.env['ProgramFiles(x86)']].filter(Boolean);
  const candidates = [
    ...programFiles.flatMap((pf) => binsUnder(path.join(pf, 'MySQL'))),
    ...programFiles.flatMap((pf) => {
      try { return fs.readdirSync(pf).filter((d) => /^MariaDB/i.test(d)).map((d) => path.join(pf, d, 'bin')); }
      catch { return []; }
    }),
    'C:\\xampp\\mysql\\bin',
    ...binsUnder('C:\\wamp64\\bin\\mysql'),
    ...binsUnder('C:\\wamp\\bin\\mysql'),
    ...binsUnder('C:\\laragon\\bin\\mysql'),
  ];
  const hit = candidates.map((dir) => path.join(dir, exe)).find((f) => fs.existsSync(f));
  return hit ?? null;
};

const backup = (label = 'backup') => {
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  if (!DB_NAME || !DB_USER) throw new Error('DB_NAME / DB_USER are not set in backend/.env');

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(BACKUP_DIR, `${DB_NAME}-full-before-${label}-${stamp}.sql`);

  const mysqldump = findMysqldump();
  if (!mysqldump) {
    throw new Error(
      'mysqldump was not found. Add MYSQLDUMP_PATH=<full path to mysqldump.exe> to backend/.env and run again.'
    );
  }

  const args = [
    `--host=${DB_HOST || 'localhost'}`, `--port=${DB_PORT || 3306}`, `--user=${DB_USER}`,
    '--single-transaction', '--routines', '--triggers', '--no-tablespaces', `--result-file=${file}`,
    DB_NAME,
  ];
  const result = spawnSync(mysqldump, args, {
    env: { ...process.env, MYSQL_PWD: DB_PASSWORD ?? '' },
    encoding: 'utf8',
  });
  if (result.error) throw new Error(`mysqldump could not start: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`mysqldump failed: ${result.stderr.trim()}`);

  const size = fs.statSync(file).size;
  if (!size) throw new Error('mysqldump wrote an empty file');
  return { file, size };
};


module.exports = { BACKUP_DIR, findMysqldump, backup };
