const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const multer = require('multer');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/images'));
  },
  filename: function (req, file, cb) {
    // Keep original filename or add timestamp
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// =====================
// 1️⃣ Set up view engine
// =====================
app.set('view engine', 'ejs');
// Parse POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: 'replace_this_with_a_real_secret', // must be secret in production
  resave: false,
  saveUninitialized: true
}));

// Serve static admin files
app.use('/admin/static', express.static(path.join(__dirname, 'admin')));
const ADMIN_PASSWORD = 'jerzy';

// Admin route
app.get('/admin', (req, res) => {
    if (req.session.loggedIn) {
    // Already logged in → show admin panel
    res.render(path.join(__dirname, "admin/index.ejs"), {
    title: 'Admin Panel'
  });
  } else {
    // Not logged in → show login form
    res.render(path.join(__dirname, "admin/login.ejs"), { error: null });
  }
});
// POST /admin (login form submission)
app.post('/admin', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.render(path.join(__dirname, "admin/login.ejs"), { error: 'Incorrect password' });
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

  // File uploaded successfully
  res.send(`
    <p>Image uploaded successfully!</p>
    <p><a href="/admin">Back to Admin Panel</a></p>
    <p>File path: <code>/images/${req.file.filename}</code></p>
  `);
});

// Redirect '/' to English home
app.get('/', (req, res) => {
  res.redirect('/en/home');
});
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);

// Default layout file (views/layouts/main.ejs)
app.set('layout', 'layouts/main');

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// =====================
// 2️⃣ ROUTES
// =====================

// English routes
app.use('/en', require('./routes/en'));

// Spanish routes
app.use('/es', require('./routes/es'));

// =====================
// 3️⃣ ROOT REDIRECT
// =====================



// =====================
// 4️⃣ ERROR HANDLING
// =====================

// Handle 404
app.use((req, res, next) => {
  res.status(404);
  // If EN path
  if (req.path.startsWith('/en')) {
    res.render('en/404', { title: 'Page Not Found', lang: 'en', page: '' });
  }
  // If ES path
  else if (req.path.startsWith('/es')) {
    res.render('es/404', { title: 'Página no encontrada', lang: 'es', page: '' });
  }
  // Otherwise, default
  else {
    res.send('Page not found');
  }
});

// =====================
// 5️⃣ START SERVER
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

