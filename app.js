const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

// =====================
// 1️⃣ Set up view engine
// =====================
app.set('view engine', 'ejs');
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

// Redirect '/' to English home
app.get('/', (req, res) => {
  res.redirect('/en/home');
});

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

