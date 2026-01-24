// middleware/auth.js
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next(); // allow access
  } else {
    res.redirect('/admin'); // redirect to login
  }
}

module.exports = requireLogin;
