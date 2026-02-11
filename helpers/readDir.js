const fs = require('fs').promises;
const path = require('path');

async function readDir(baseRoot, relativePath) {
  const targetPath = relativePath
    ? path.join(baseRoot, relativePath)
    : baseRoot;
  const dirents = await fs.readdir(targetPath, { withFileTypes: true });
  const result = [];
  for (const d of dirents) {
    if (d.isDirectory()) {
      result.push({ name: d.name, type: 'dir' });
      continue;
    }
    if (d.isFile()) {
      result.push({ name: d.name, type: 'file' });
    }
  }
  return result;
}

module.exports = readDir;
