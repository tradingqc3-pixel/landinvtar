const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const distDirectory = path.join(projectRoot, 'dist');

fs.rmSync(distDirectory, { recursive: true, force: true });
fs.mkdirSync(path.join(distDirectory, 'admin'), { recursive: true });
fs.cpSync(path.join(projectRoot, 'website', 'dist'), distDirectory, { recursive: true });
fs.cpSync(path.join(projectRoot, 'admin', 'dist'), path.join(distDirectory, 'admin'), { recursive: true });