function extractBody(html) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}

function extractAssets(html) {
  const styles = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)]
    .map(m => m[0])
    .join('\n');

  const scripts = [...html.matchAll(/<script[^>]+src=["'][^"']+["'][^>]*><\/script>/gi)]
    .map(m => m[0])
    .join('\n');

  return { styles, scripts };
}

module.exports = { extractBody, extractAssets };
