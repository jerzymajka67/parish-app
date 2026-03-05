const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const requireLogin = require(path.join(APP_ROOT, 'middleware', 'auth'));
const CONTENT_ROOT = path.join(APP_ROOT, 'content');
const readDir = require(path.join(APP_ROOT, 'helpers', 'readDir'));
const  storeDirInTree = require(path.join(APP_ROOT, 'helpers', 'storeDirInTree'));

const transformDirList = require(path.join(APP_ROOT, 'helpers', 'transformDirList'));
let tree = {}
function getNode(obj, pathStr) {
  if (!pathStr) return obj;
  return pathStr.split('/').reduce((cur, key) => cur?.[key], obj);
}
router.get('/', requireLogin, (req, res) => {
    res.render('pages/admin/conten', { 
    layout: 'layouts/admin',
    title: 'Conten - admin', 
    lang: 'en', 
    page: 'conten',
    favicon: '/images/logo-olqa-mini.png',
    msg: req.query.msg || null,
    status: req.query.status || null
  });
});

router.get('/ls', requireLogin, async (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const content = transformDirList(await readDir(CONTENT_ROOT, relativePath));
    storeDirInTree(tree, relativePath, content);
    res.json(getNode(tree, relativePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;