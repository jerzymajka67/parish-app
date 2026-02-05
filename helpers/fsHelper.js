const fs = require('fs').promises;
const path = require('path');

// Absolute path to the content folder
const CONTENT_DIR = path.join(global.APP_ROOT, 'content');

// --------------- Safety -----------------
function resolveSafePath(relativePath = '') {
  const fullPath = path.join(CONTENT_DIR, relativePath);
  console.log('Resolving path:', relativePath, '->', fullPath);

 if (fullPath === CONTENT_DIR || fullPath.startsWith(CONTENT_DIR + path.sep)) {
  // allowed, do nothing
} else {
  throw new Error('Access denied');
}
  return fullPath;
}

// --------------- Directory operations -----------------
async function listDir(relativePath = '') {
  console.log('root - ', APP_ROOT )
  const dirPath = resolveSafePath(relativePath);
  const items = await fs.readdir(dirPath, { withFileTypes: true });

  return items
    .filter(item => item.name !== 'tmp') // hide tmp folder
    .map(item => ({
      name: item.name,
      type: item.isDirectory() ? 'dir' : 'file'
    }));
}

async function createDir(relativePath, dirName) {
  const dirPath = resolveSafePath(path.join(relativePath, dirName));
  await fs.mkdir(dirPath, { recursive: true });
  return dirPath;
}

async function deleteFileOrDir(relativePath) {
  const targetPath = resolveSafePath(relativePath);
  const stat = await fs.stat(targetPath);

  if (stat.isDirectory()) {
    await fs.rm(targetPath, { recursive: true, force: true });
  } else {
    await fs.unlink(targetPath);
  }
}

// --------------- File operations -----------------
async function readFile(relativePath, encoding = 'utf8') {
  const filePath = resolveSafePath(relativePath);
  return fs.readFile(filePath, encoding);
}

async function saveUploadedFile(file, relativePath = '') {
  const destDir = resolveSafePath(relativePath);
  await fs.mkdir(destDir, { recursive: true });

  const targetPath = path.join(destDir, file.originalname);
  await fs.rename(file.path, targetPath);

  return targetPath;
}

// --------------- Utility -----------------
async function exists(relativePath) {
  try {
    const fullPath = resolveSafePath(relativePath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

// --------------- Exports -----------------
module.exports = {
  CONTENT_DIR,
  resolveSafePath,
  listDir,
  createDir,
  deleteFileOrDir,
  readFile,
  saveUploadedFile,
  exists
};
