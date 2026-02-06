const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKUP_DIR = path.join(ROOT, 'comment-backups', new Date().toISOString().replace(/[:.]/g,'_'));
const EXTS = ['.js', '.cjs', '.vue'];
const IGNORE_DIRS = ['node_modules', '.git', 'comment-backups'];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (IGNORE_DIRS.includes(file)) continue;
      results = results.concat(walk(full));
    } else {
      if (EXTS.includes(path.extname(full))) results.push(full);
    }
  }
  return results;
}

function ensureBackup(file) {
  const rel = path.relative(ROOT, file);
  const dest = path.join(BACKUP_DIR, rel);
  const destDir = path.dirname(dest);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(file, dest);
}

function stripCommentsFromCode(code) {
  let out = '';
  let i = 0;
  const len = code.length;
  let state = null; // 'single','double','template','line_comment','block_comment'
  while (i < len) {
    const ch = code[i];
    const ch2 = code[i+1];
    if (state === null) {
      if (ch === '/' && ch2 === '/') {
        state = 'line_comment';
        i += 2;
        continue;
      }
      if (ch === '/' && ch2 === '*') {
        state = 'block_comment';
        i += 2;
        continue;
      }
      if (ch === "'") {
        state = 'single';
        out += ch; i++; continue;
      }
      if (ch === '"') {
        state = 'double';
        out += ch; i++; continue;
      }
      if (ch === '`') {
        state = 'template';
        out += ch; i++; continue;
      }
      out += ch; i++; continue;
    }
    if (state === 'line_comment') {
      if (ch === '\n') {
        out += ch;
        state = null;
      }
      i++; continue;
    }
    if (state === 'block_comment') {
      if (ch === '*' && ch2 === '/') {
        i += 2; state = null; continue;
      }
      if (ch === '\n') out += '\n';
      i++; continue;
    }
    if (state === 'single') {
      if (ch === "\\") {
        out += ch; out += code[i+1] || ''; i += 2; continue;
      }
      if (ch === "'") {
        out += ch; i++; state = null; continue;
      }
      out += ch; i++; continue;
    }
    if (state === 'double') {
      if (ch === '\\') {
        out += ch; out += code[i+1] || ''; i += 2; continue;
      }
      if (ch === '"') {
        out += ch; i++; state = null; continue;
      }
      out += ch; i++; continue;
    }
    if (state === 'template') {
      if (ch === '\\') {
        out += ch; out += code[i+1] || ''; i += 2; continue;
      }
      if (ch === '`') {
        out += ch; i++; state = null; continue;
      }
      out += ch; i++; continue;
    }
  }
  return out;
}

function stripHtmlComments(code) {
  return code.replace(/<!--([\s\S]*?)-->/g, '');
}

function processFile(file) {
  try {
    const original = fs.readFileSync(file, 'utf8');
    ensureBackup(file);
    let transformed = stripCommentsFromCode(original);
    if (path.extname(file) === '.vue') {
      transformed = stripHtmlComments(transformed);
    }
    fs.writeFileSync(file, transformed, 'utf8');
    console.log('Processed:', file);
    return true;
  } catch (err) {
    console.error('Error processing', file, err.message);
    return false;
  }
}

function main() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const files = walk(ROOT);
  console.log('Files to process:', files.length);
  let count = 0;
  for (const f of files) {
    if (f.startsWith(path.join(ROOT, 'scripts'))) continue;
    if (processFile(f)) count++;
  }
  console.log(`Done. Processed ${count}/${files.length} files. Backups in ${BACKUP_DIR}`);
}

main();
