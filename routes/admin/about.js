const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
//const ejs = require('ejs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
//const cheerio = require('cheerio');
const requireLogin = require(path.join(APP_ROOT, 'middleware', 'auth'));
const stampFileName = require(path.join(APP_ROOT, 'helpers', 'stampFileName'));
//const sanitizeHtml = require(path.join(APP_ROOT, 'helpers', 'sanitizeHtml'));
const { extractBody, extractAssets } = require(path.join(APP_ROOT, 'helpers', 'htmlUtils'));
const EVENTS_ROOT = path.join(APP_ROOT, 'content/about');
const TargetDir = path.join(APP_ROOT, 'views/pages/user');

router.get('/',  requireLogin, (req, res) => {
    res.render('pages/admin/about', { 
    layout: 'layouts/admin',
    title: 'About - admin', 
    lang: 'en', 
    page: 'about',
    favicon: '/images/logo-olqa-mini.png',
    msg: req.query.msg || null,
    status: req.query.status || null
  });
});
router.get('/view', requireLogin, async (req, res) => {
   const fileName = req.query.fileName;
  try {
    const sourcePath = path.join(EVENTS_ROOT, fileName);
    const targetPath = path.join(TargetDir, 'en/about_temp.ejs');
    const html = await fs.readFile(sourcePath, 'utf8');
    const bodyContent = extractBody(html);
    await fs.writeFile(targetPath, bodyContent, 'utf8');
    res.render('pages/user/en/about_temp', {
      layout: 'layouts/user',
      title: 'About',
      lang: 'en',
      page: 'about',
      favicon: '/images/logo-olqa-mini.png',
      preview: true
    });
  }  catch (err) {
      const msg = `Failed to publish HTML file ${fileName} in English version - ${err.message}`;
      const status = 'error';
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
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
   let fileName = req.body.fileName;
    try {
      if (!fileName) {
      const msg = 'File name is required';
      const status = 'error';
       return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
    if (!fileName.endsWith('.html')) {
      fileName += '.html';
    }
    const filePath = path.join(EVENTS_ROOT,  fileName);
    try {
      await fs.access(filePath);
      const msg = 'File already exists';
      const status = 'error';
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
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
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    } catch (err) {
      const msg = `Server error while creating HTML file ${fileName} - ${err.message}`;
      const status = 'error';
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});
router.post('/upload-file', requireLogin, upload.single('html'), async (req, res) => {
  let originalName;
  try {
    const targetDir = EVENTS_ROOT;

    if (!req.file) {
      const msg = `HTML file could not be uploaded - no file received`;
      const status = 'error';
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
    originalName = req.file.originalname;
    const targetPath = path.join(targetDir, originalName);
    try {
      await fs.access(targetPath);
      // If we got here → file exists
      await fs.unlink(req.file.path); // cleanup temp upload
      const msg = `HTML file ${originalName} already exists`;
      const status = 'error';
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    } catch {
      // fs.access failed → file does NOT exist (this is what we want)
    }
    await fs.rename(req.file.path, targetPath);
    const msg = `HTML file ${originalName} - uploaded successfully`;
    const status = 'success';
    return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);

  } catch (err) {
    // cleanup temp file if something exploded
    if (req.file?.path) {
      try { await fs.unlink(req.file.path); } catch {}
    }
    const msg = `HTML file ${originalName ?? ''} could not be uploaded - ${err.message}`;
    const status = 'error';
    return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});
router.post('/publish-en', requireLogin, async (req, res) => {
  const fileName = req.body.fileName;
  try {
    const sourcePath = path.join(EVENTS_ROOT, fileName);
    const targetPath = path.join(TargetDir, 'en/about.ejs');
    const html = await fs.readFile(sourcePath, 'utf8');
    const bodyContent = extractBody(html);
    await fs.writeFile(targetPath, bodyContent, 'utf8');
    const msg = `HTML file ${fileName} - published successfully in English version`;
    const status = 'success';
    return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
      const msg = `Failed to publish HTML file ${fileName} in English version - ${err.message}`;
      const status = 'error';
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});
router.post('/publish-es', requireLogin, async (req, res) => {
  const fileName = req.body.fileName;
  try {
    const sourcePath = path.join(EVENTS_ROOT, fileName);
    const targetPath = path.join(TargetDir, 'es/sobre.ejs');
    const html = await fs.readFile(sourcePath, 'utf8');
    const bodyContent = extractBody(html);
    await fs.writeFile(targetPath, bodyContent, 'utf8');
    const msg = `HTML file ${fileName} - published successfully in Spanish version`;
    const status = 'success';
    return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
      const msg = `Failed to publish HTML file ${fileName} in Spanish version - ${err.message}`;
      const status = 'error';
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});
router.post('/delete-file', requireLogin, async (req, res) => {
  const fileName = req.body.fileName;
  try {
    if (!fileName) {
        const msg = ` File name is required for deletion`;
        const status = 'error';
        return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }

    const filePath = path.join(EVENTS_ROOT, fileName);
    await fs.unlink(filePath);
        const msg = ` HTML file ${fileName} - deleted successfully`;
        const status = 'success';
        return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const msg = `File ${fileName} not found for deletion`;
      const status = 'error';
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
      const msg = ` HTML file ${fileName} could not be deleted - ${err.message}`;
      const status = 'error';
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});
router.post('/rename', requireLogin, async (req, res) => {
  let { fileName, newName } = req.body;
  try {
    if (!fileName || !newName) {
      const msg = `Both old and new file names are required`;
      const status = 'error';
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
    if (!newName.toLowerCase().endsWith('.html')) {
      newName = `${newName}.html`;
    }
    const oldPath = path.join(EVENTS_ROOT, fileName);
    const newPath = path.join(EVENTS_ROOT, newName);
    try {
      await fs.access(newPath);
      const msg = `File ${newName} already exists`;
      const status = 'error';
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    } catch {
      // good — new name does not exist
    }
    await fs.rename(oldPath, newPath);
    const msg = `File ${fileName} renamed to ${newName} successfully`;
    const status = 'success';
    return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const msg = `File ${fileName} not found`;
      const status = 'error';
      return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
    const msg = `Failed to rename file ${fileName} - ${err.message}`;
    const status = 'error';
    return res.redirect(`/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});
router.get('/edit', requireLogin, async (req, res) => {
  const originalFile = req.query.fileName;
  const draftFile = stampFileName(originalFile);
  console.log('Editing file:', originalFile, 'Draft file:', draftFile);
  if (!originalFile) {
    return res.redirect('/admin/about?msg=File+name+required&status=error');
  }
  const filePath = path.join(EVENTS_ROOT, originalFile);
  const backupPath = path.join(EVENTS_ROOT, draftFile);
  console.log('File path:', filePath);
  console.log('Backup path:', backupPath);
  try {
    await fs.copyFile(filePath, backupPath);
    const content = await fs.readFile(backupPath, 'utf8');
    return res.json({
      draftFile,
      originalFile,
      content
    });
  } catch (err) {
    console.error(err);
    return res.redirect('/admin/about?msg=File+error&status=error');
  }
});
router.post('/save', requireLogin, async (req, res) => {
  console.log('Saving file:', req.body);
  const { draftFile, content } = req.body;

  if (!draftFile || content === undefined) {
    return res.redirect('/admin/about?msg=Invalid+data&status=error');
  }

  try {
    await fs.writeFile(
      path.join(EVENTS_ROOT, draftFile),
      content,
      'utf8'
    );

    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.redirect('/admin/about?msg=Save+failed&status=error');
  }
});
router.post('/save-exit', requireLogin, async (req, res) => {
  const { draftFile, originalFile, content } = req.body;

  if (!draftFile || !originalFile || content === undefined) {
    const msg = 'File name and content are required';
    const status = 'error';
    return res.redirect(
      `/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
    );
  }

  const filePath = path.join(EVENTS_ROOT, draftFile);

  try {
    await fs.writeFile(filePath, content, 'utf8');

    const msg =
      `New version of original file "${originalFile}" is now in "${draftFile}" and ready to be published. ` +
      `Please review it and publish when ready.`;
    const status = 'success';
    return res.redirect(
      `/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
    );
  } catch (err) {
    console.error(err);
    const msg = 'Failed to save file';
    const status = 'error';
    return res.redirect(
      `/admin/about?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
    );
  }
});
module.exports = router;