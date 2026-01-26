const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Base folder for events content (relative to project root)
const EVENTS_ROOT = path.join(__dirname, '..', '..', 'content', 'events');
const tmpFolder = path.join(EVENTS_ROOT, 'tmp');
if (!fs.existsSync(tmpFolder)) {
  fs.mkdirSync(tmpFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const currentPath = req.body.currentPath || '';
    const folderPath = path.join(EVENTS_ROOT, currentPath);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // max 5 MB
});

function buildBreadcrumbs(currentPath) {
  if (!currentPath) return [];

  const parts = currentPath.split('/');
  let accumulated = '';
  return parts.map(part => {
    accumulated = accumulated ? accumulated + '/' + part : part;
    return {
      name: part,
      path: accumulated
    };
  });
}

function listDirectory(currentPath) {
  const fullPath = path.join(EVENTS_ROOT, currentPath);
  const items = [];

  if (!fs.existsSync(fullPath)) return items;

  fs.readdirSync(fullPath, { withFileTypes: true }).forEach(dirent => {
    if (dirent.name === 'tmp') return;

    if (dirent.isDirectory()) {
      items.push({ name: dirent.name, type: 'folder' });
    } else {
      items.push({ name: dirent.name, type: 'file' });
    }
  });

  return items;
}

module.exports = {
  EVENTS_ROOT,
  tmpFolder,
  upload,
  buildBreadcrumbs,
  listDirectory
};
