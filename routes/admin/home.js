const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cheerio = require('cheerio');
const requireLogin = require(path.join(APP_ROOT, 'middleware', 'auth'));
const EVENTS_ROOT = path.join(APP_ROOT, 'content/home');
const TargetDir = path.join(APP_ROOT, 'views/pages/user');

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
    favicon: '/images/logo-olqa-mini.png',
    msg: req.query.msg || null,
    status: req.query.status || null
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
   const fileName = req.body.fileName;
    try {
      if (!fileName) {
      const msg = 'File name is required';
      const status = 'error';
       return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
    if (!fileName.endsWith('.html')) {
      fileName += '.html';
    }
    const filePath = path.join(EVENTS_ROOT,  fileName);
    try {
      await fs.access(filePath);
      const msg = 'File already exists';
      const status = 'error';
      return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
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
      const msg = `File ${fileName} created successfully`;
      const status = 'success';
      return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    } catch (err) {
      const msg = `Server error while creating HTML file ${fileName} - ${err.message}`;
      const status = 'error';
      return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});

router.post('/upload-file', requireLogin, upload.single('html'), async (req, res) => {
  try {
     const targetDir =EVENTS_ROOT;
     if (!req.file) {
        const msg = ` HTML file could not be uploaded - no file received`;
        const status = 'error';
        return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);}      
        const originalName =  req.file.originalname;

  await fs.rename(req.file.path, path.join(targetDir, originalName));
      const msg = `HTML file ${originalName} - uploaded successfully`;
      const status = 'success';
      return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
        const msg = ` HTML file ${originalName} could not be uploaded - ${err.message}`;
        const status = 'error';
        return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});
router.post('/publish-en', requireLogin, async (req, res) => {
  const fileName = req.body.fileName;
  try {
    const sourcePath = path.join(EVENTS_ROOT, fileName);
    const targetPath = path.join(TargetDir, 'en/home.ejs');
    const html = await fs.readFile(sourcePath, 'utf8');
    const bodyContent = extractBody(html);
    await fs.writeFile(targetPath, bodyContent, 'utf8');
    const msg = `HTML file ${fileName} - published successfully in English version`;
    const status = 'success';
    return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
      const msg = `Failed to publish HTML file ${fileName} in English version - ${err.message}`;
      const status = 'error';
      return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});
router.post('/publish-es', requireLogin, async (req, res) => {
  const fileName = req.body.fileName;
  try {
    const sourcePath = path.join(EVENTS_ROOT, fileName);
    const targetPath = path.join(TargetDir, 'es/home.ejs');
    const html = await fs.readFile(sourcePath, 'utf8');
    const bodyContent = extractBody(html);
    await fs.writeFile(targetPath, bodyContent, 'utf8');
    const msg = `HTML file ${fileName} - published successfully in Spanish version`;
    const status = 'success';
    return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
      const msg = `Failed to publish HTML file ${fileName} in Spanish version - ${err.message}`;
      const status = 'error';
      return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});

router.post('/delete-file', requireLogin, async (req, res) => {
  const fileName = req.body.fileName;
  try {
    if (!fileName) {
        const msg = ` File name is required for deletion`;
        const status = 'error';
        return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }

    const filePath = path.join(EVENTS_ROOT, fileName);
    await fs.unlink(filePath);
        const msg = ` HTML file ${fileName} - deleted successfully`;
        const status = 'success';
        return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const msg = `File ${fileName} not found for deletion`;
      const status = 'error';
      return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
      const msg = ` HTML file ${fileName} could not be deleted - ${err.message}`;
      const status = 'error';
      return res.redirect(`/admin/home?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});

router.get('/file', requireLogin, async(req, res) => {
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