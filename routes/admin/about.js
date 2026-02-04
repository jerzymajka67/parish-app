const express = require('express');
const router = express.Router();
//const fs = require('fs');
const fs = require('fs/promises');
const { exec } = require('child_process');
const path = require('path');
const readDir = require(path.join(APP_ROOT, 'helpers', 'readDir'));
const transformDirList = require(path.join(APP_ROOT, 'helpers', 'transformDirList'));
const storeDirInTree = require(path.join(APP_ROOT, 'helpers', 'storeDirInTree'));
let tree = {};
// Root folder for safety
const   EVENTS_ROOT = path.join(APP_ROOT , 'content');
function getNode(obj, path) {
  if (path == '') return obj;
  return path
    .split('/')
    .reduce((current, key) => current?.[key], obj);
}
// All admin routes (kept existing behavior; add buildTreeHTML to /events render)
router.get('/',  (req, res) => {
  tree = {};
  res.render('pages/admin/about', { 
    layout: 'layouts/admin',
    title: 'About - admin', 
    lang: 'en', 
    page: 'about',
    favicon: '/images/logo-olqa-mini.png'
  });
});

router.get('/ls', async function (req, res) {

  try {
    const relativePath = req.query.path || '';
        const content = transformDirList(await readDir(EVENTS_ROOT, relativePath));
        storeDirInTree(tree, relativePath, content);
        console.log('relativePath:', relativePath, 'Node:', getNode(tree, relativePath));
        res.json(getNode(tree, relativePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/create-folder', async (req, res) => {
  try {
    const currentPath = req.body.currentPath || '';
    const folderName = req.body.folderName;

    console.log('Creating folder:', folderName, 'in path:', currentPath, 'req.body:', req.body);

    if (!folderName) {
      return res.status(400).send('Folder name is required');
    }

    // Sanitize folder name (remove dangerous characters)
    const safeName = folderName.replace(/[/\\?%*:|"<>]/g, '-');

    // Construct the full folder path
    const newFolderPath = path.join(EVENTS_ROOT, path.normalize(currentPath), safeName);

    // Check if folder exists
    try {
      await fs.access(newFolderPath);
      // Folder exists
      console.log('Folder already exists:', newFolderPath);
    } catch {
      // Folder does not exist → create it
      await fs.mkdir(newFolderPath, { recursive: true });
      console.log('Folder created:', newFolderPath);
    }

    // Redirect back to the current folder after creating
    res.redirect(`/admin/about?path=${encodeURIComponent(currentPath)}`);

  } catch (err) {
    console.error('Error creating folder:', err);
    res.status(500).send('Server error while creating folder');
  }
});
// Delete selected files and folders
router.post('/delete-selected', async (req, res) => {
  const { currentPath } = req.body;

  console.log('relativePath from server:', currentPath);

  if (!currentPath) {
    return res.status(400).send('No folder selected');
  }

  const fullPath = path.join(EVENTS_ROOT, currentPath);

  try {
    await fs.rm(fullPath, { recursive: true, force: true });
    console.log('Deleted:', fullPath);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Delete failed');
  }

  // go one level up after delete
  const parentPath = currentPath.split('/').slice(0, -1).join('/');

  res.redirect(`/admin/about?path=${encodeURIComponent(parentPath)}`);
});

module.exports = router;