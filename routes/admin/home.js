const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cheerio = require('cheerio');
const readDir = require(path.join(APP_ROOT, 'helpers', 'readDir'));
const transformDirList = require(path.join(APP_ROOT, 'helpers', 'transformDirList'));
const storeDirInTree = require(path.join(APP_ROOT, 'helpers', 'storeDirInTree'));
const requireLogin = require(path.join(APP_ROOT, 'middleware', 'auth'));
const EVENTS_ROOT = path.join(APP_ROOT, 'content/home');
const TargetDir = path.join(APP_ROOT, 'views/pages/user');
let tree = {};


function extractBody(html) {
  const $ = cheerio.load(html, {
    decodeEntities: false
  });

  const body = $('body').html();

  if (!body) {
    throw new Error('No <body> tag found in HTML');
  }

  return body.trim();
}

// All admin routes (kept existing behavior; add buildTreeHTML to /events render)
router.get('/',  requireLogin, (req, res) => {
  res.render('pages/admin/home', { 
    layout: 'layouts/admin',
    title: 'Home - admin', 
    lang: 'en', 
    page: 'home',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/ls', requireLogin, async (req, res) => {
  try {
    const entries = await fs.readdir(EVENTS_ROOT, { withFileTypes: true });

    const files = entries
      .filter(e => e.isFile())
      .map(e => e.name);

    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create-html', requireLogin, async (req, res) => {
  try {
    let fileName = req.body.fileName;
    console.log('Creating HTML file:', fileName);
    if (!fileName) {
      return res.status(400).send('File name is required');
    }
    fileName =  fileName.replace(/[/\\?%*:|"<>]/g, '-');
    if (!fileName.endsWith('.html')) {
      fileName += '.html';
    }
    const filePath = path.join(EVENTS_ROOT,  fileName);
    try {
      await fs.access(filePath);
      return res.status(409).send('File already exists');
    } catch {
      // file does not exist → OK
    }

    // minimal HTML skeleton
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${fileName.replace('.html', '')}</title>
</head>
<body>

</body>
</html>`;

   await fs.writeFile(filePath, htmlTemplate, 'utf8');
      res.redirect(`/admin/home?path=${encodeURIComponent('')}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while creating HTML file');
  }
});

router.post('/upload-file', requireLogin, upload.single('html'), async (req, res) => {
  try {
      console.log(req.file);
    const targetDir =EVENTS_ROOT;
   
    if (!req.file) return res.status(400).send('No HTML uploaded');
    const originalName =  req.file.originalname;
;
await fs.rename(req.file.path, path.join(targetDir, originalName));
    res.redirect(`/admin/home?path=${encodeURIComponent('')}`);
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
});
router.post('/publish-en', requireLogin, async (req, res) => {
  console.log('from publish-en ', req.body + ' request.body.fileName', req.body.fileName);
  try {
    const sourcePath = path.join(EVENTS_ROOT, req.body.fileName);
    const targetPath = path.join(TargetDir, 'en/home.ejs');
    const html = await fs.readFile(sourcePath, 'utf8');
    const bodyContent = extractBody(html);
    await fs.writeFile(targetPath, bodyContent, 'utf8');

    res.json({
      ok: true,
      publishedAs: 'home.ejs'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/publish-es', requireLogin, async (req, res) => {
  try {
    const sourcePath = path.join(EVENTS_ROOT, req.body.fileName);
    const targetPath = path.join(TargetDir, 'es/home.ejs');
    const html = await fs.readFile(sourcePath, 'utf8');
    const bodyContent = extractBody(html);
    await fs.writeFile(targetPath, bodyContent, 'utf8');

    res.json({
      ok: true,
      publishedAs: 'home.ejs'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/delete-file', requireLogin, async (req, res) => {
  console.log('Delete request for file:', req.body.fileName);
  try {
    const fileName = req.body.fileName;

    if (!fileName) {
      return res.status(400).send('File name required');
    }

    const filePath = path.join(EVENTS_ROOT, fileName);

    await fs.unlink(filePath);

    res.redirect('/admin/home');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).send('File not found');
    }
    console.error(err);
    res.status(500).send('Delete failed');
  }
});

router.get('/file', requireLogin, async(req, res) => {
  console.log('Requested file path:', req.query.fileName);
  const fileName = req.query.fileName;
  const filePath = path.join(EVENTS_ROOT, fileName);
  console.log('Resolved full path:', filePath);
   try {
      const content = await fs.readFile(filePath, 'utf8');
      res.json({ path: fileName, content });
    } catch (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
module.exports = router;