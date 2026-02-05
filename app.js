const express = require('express');
const path = require('path');
require('module-alias/register');
global.APP_ROOT = __dirname;
const expressLayouts = require('express-ejs-layouts'); // 
const routes = require('./routes');

const app = express();

// Views & EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/content', express.static(path.join(APP_ROOT, 'content')));

// Enable express-ejs-layouts
app.use(expressLayouts);

// Default layout (optional)
app.set('layout', 'layouts/user');
app.use((req, res, next) => {
  console.log('METHOD:', req.method);
  console.log('PATH:', req.path);
  console.log('ORIGINAL URL:', req.originalUrl);
  console.log('----------------------');
  next();
});
// Routes
app.use('/', routes);

// Server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
