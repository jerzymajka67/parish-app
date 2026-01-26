const fs = require('fs');
const path = require('path');

const EVENTS_ROOT = path.join(__dirname, '../content/events');

function buildTreeHTML(relPath = '') {
  const absPath = path.join(EVENTS_ROOT, relPath);

  if (!fs.existsSync(absPath)) return '';

  // Read folder contents, hide 'tmp', show only directories + .webp files
  const items = fs.readdirSync(absPath, { withFileTypes: true })
    .filter(item => {
      if (item.name === 'tmp') return false;
      return item.isDirectory() || path.extname(item.name).toLowerCase() === '.webp';
    })
    .sort((a, b) => {
      // Directories first, then files, alphabetical
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  if (!items.length) return '';

  let html = '<ul>';

  items.forEach(item => {
    const type = item.isDirectory() ? 'folder' : 'file';
    const itemPath = path.join(relPath, item.name).replace(/\\/g, '/');

    html += `<li class="tree-item">`;

    // Checkbox for deletion
    html += `<input type="checkbox" name="selected[]" value="${type}:${itemPath}">`;

    if (type === 'folder') {
      // Folder span (clickable)
      html += `<span class="folder-name">📂 ${item.name}</span>`;

      // Nested children, initially hidden
      html += `<div class="children hidden">${buildTreeHTML(itemPath)}</div>`;
    } else {
      // Only show .webp files
      html += `<a class="file-link" href="/content/events/${itemPath}" target="_blank">🖼 ${item.name}</a>`;
    }

    html += '</li>';
  });

  html += '</ul>';
  return html;
}

module.exports = { buildTreeHTML };
