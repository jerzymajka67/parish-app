const fs = require('fs').promises;
const path = require('path');

async function readDir(baseRoot, relativePath) {
  console.log(`Reading directory: baseRoot=${baseRoot}, relativePath=${relativePath}`);
  const targetPath = relativePath
    ? path.join(baseRoot, relativePath)
    : baseRoot;
    console.log(`Resolved target path: ${targetPath}`);
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
