require('path');
const path = require('path');
const fsHelper = require(path.join(APP_ROOT, 'helpers', 'fsHelper'));


function renderPage(pageName, extraOptions) {
  if (!extraOptions) {
    extraOptions = {};
  }
  return async function (req, res) {if(req.query.path===undefined){fsHelper.listDir('/').then(function (files) {
    res.render('pages/admin/' + pageName, {
        layout: 'layouts/admin',
        title: pageName.charAt(0).toUpperCase() + pageName.slice(1) + ' - admin',
        lang: 'en',
        page: pageName,
        favicon: '/images/logo-olqa-mini.png',
        files: files,
        ...extraOptions
      });
    }); } else{

      try {
        const files = await fsHelper.listDir('/partials');
        res.json({ files });
        console.log("Path query:", files);
      } catch (err) {
        console.error(err); // log for debugging
        res.status(500).json({ error: 'Failed to list files' });
      }
   }

  };
}

module.exports = {
  renderPage: renderPage
};

