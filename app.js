const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const expressLayouts = require('express-ejs-layouts');

// =====================
// BASIC APP SETUP
// =====================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =====================
// SESSION
// =====================
app.use(session({
  secret: 'replace_this_with_a_real_secret',
  resave: false,
  saveUninitialized: false
}));

// =====================
// STATIC FILES
// =====================
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin/static', express.static(path.join(__dirname, 'admin/static')));

// =====================
// EJS LAYOUTS (PUBLIC ONLY)
// =====================
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// =====================
// MULTER (IMAGE UPLOAD)
// =====================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/images'));
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// =====================
// ADMIN AUTH
// =====================
const ADMIN_PASSWORD = 'jerzy';

// =====================
// ADMIN ROUTES
// =====================
app.get('/admin', (req, res) => {
  if (req.session.loggedIn) {
    res.render('admin/index', {
      title: 'Admin Panel',
      layout: false
    });
  } else {
    res.render('admin/login', {
      error: null,
      layout: false
    });
  }
});

app.post('/admin', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.render('admin/login', {
      error: 'Incorrect password',
      layout: false
    });
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin');
  });
});

app.post('/admin/upload-image', upload.single('image'), (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/admin');
  }

  if (!req.file) {
    return res.send('No file uploaded');
  }

  res.send(`
    <p>Image uploaded successfully!</p>
    <p><a href="/admin">Back to Admin Panel</a></p>
    <p>File path: <code>/images/${req.file.filename}</code></p>
  `);
});

// =====================
// PUBLIC ROUTES
// =====================

// Root → English home
app.get('/', (req, res) => {
  res.redirect('/en/home');
});

// Language routes
app.use('/en', require('./routes/en'));
app.use('/es', require('./routes/es'));

// =====================
// 404 HANDLING
// =====================
app.use((req, res) => {
  res.status(404);

  if (req.path.startsWith('/en')) {
    res.render('en/404', { title: 'Page Not Found', lang: 'en' });
  } else if (req.path.startsWith('/es')) {
    res.render('es/404', { title: 'Página no encontrada', lang: 'es' });
  } else {
    res.send('Page not found');
  }
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
