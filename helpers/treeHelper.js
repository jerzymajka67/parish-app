// helpers/treeHelper.js
const path = require('path');
const fs = require('fs');

const EVENTS_ROOT = path.join(__dirname, '../content/events');

function buildTreeHTML(relPath = '') {
  const absPath = path.join(EVENTS_ROOT, relPath);
  if (!fs.existsSync(absPath)) return '';

  const items = fs.readdirSync(absPath, { withFileTypes: true })
    .filter(item => item.isDirectory() || path.extname(item.name).toLowerCase() === '.webp');

  if (!items.length) return '';

  let html = '<ul>';
  items.forEach(item => {
    const itemPath = path.join(relPath, item.name).replace(/\\/g, '/');
    const type = item.isDirectory() ? 'folder' : 'file';
    html += `<li>
      <input type="checkbox" name="selected[]" value="${type}:${itemPath}">`;

    if (type === 'folder') {
      html += `<span class="folder">📂 ${item.name}</span>`;
      // Recursively generate children (collapsed by default)
      html += `<div class="children hidden">${buildTreeHTML(itemPath)}</div>`;
    } else {
      html += `<a href="/content/events/${itemPath}" target="_blank">🖼 ${item.name}</a>`;
    }

    html += `</li>`;
  });
  html += '</ul>';

  return html;
}

module.exports = { buildTreeHTML };
