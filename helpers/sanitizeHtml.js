const { JSDOM } = require('jsdom');

const ALLOWED_TAGS = new Set([
  'p', 'br',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'strong', 'em', 'b', 'i',
  'a',
  'img',
  'blockquote'
]);

function stripEjs(html) {
  // Remove ALL EJS tags: <%= %>, <%- %>, <% %>
  return html.replace(/<%[\s\S]*?%>/g, '');
}

function sanitizeHtml(html) {
  // 🔥 STEP 0: remove EJS syntax FIRST
  html = stripEjs(html);

  const dom = new JSDOM(`<body>${html}</body>`);
  const document = dom.window.document;

  function cleanNode(node) {
    // text node → keep
    if (node.nodeType === 3) return;

    // remove non-elements
    if (node.nodeType !== 1) {
      node.remove();
      return;
    }

    const tag = node.tagName.toLowerCase();

    // unwrap disallowed tags
    if (!ALLOWED_TAGS.has(tag)) {
      node.replaceWith(...node.childNodes);
      return;
    }

    // clean attributes
    [...node.attributes].forEach(attr => {
      if (tag === 'a' && attr.name === 'href') return;
      if (tag === 'img' && ['src', 'alt'].includes(attr.name)) return;
      node.removeAttribute(attr.name);
    });

    [...node.childNodes].forEach(cleanNode);
  }

  [...document.body.childNodes].forEach(cleanNode);

  return document.body.innerHTML.trim();
}

module.exports = sanitizeHtml;
