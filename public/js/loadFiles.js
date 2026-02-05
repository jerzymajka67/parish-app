function loadFiles() {
  fetch('/admin/about?path=2026')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      document.getElementById('output').textContent =
        JSON.stringify(data, null, 2);
    })
    .catch(function(err) {
      document.getElementById('output').textContent =
        'ERROR: ' + err;
    });
}
