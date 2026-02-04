function ensurePath(tree, path) {

  const parts = path.split('/');
  let current = tree;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (!current[part]) {
      current[part] = {};
    }

    current = current[part];
  }

  return current;
}
function mergeDirContent(targetNode, content) {

  for (const key in content) {

    if (key === 'files') {
      targetNode.files = content.files;
    } else {
      if (!targetNode[key]) {
        targetNode[key] = {};
      }
    }
  }
}
function storeDirInTree(tree, dirPath, content) {

  let node;

  if (dirPath && dirPath.length > 0) {
    node = ensurePath(tree, dirPath);
  } else {
    node = tree;
  }

  mergeDirContent(node, content);
}
module.exports = storeDirInTree;