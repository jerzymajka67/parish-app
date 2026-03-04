document.addEventListener('DOMContentLoaded', function () {

  let browser = document.getElementById('browser');
  if (!browser) {
    browser = document.createElement('div');
    browser.id = 'browser';
    document.body.appendChild(browser);
  }

  const lang = document.documentElement.lang || 'en';
  const page = document.documentElement.page || 'bulletin';
  const baseFolder = `content/${page}/${lang}/`;
function render(tree, basePath, container) {

  // clear only the container we are rendering into
  container.innerHTML = '';

  // 📁 folders
  for (const name in tree) {

    if (name === 'files') continue;

    const fullPath = basePath ? `${basePath}/${name}` : name;

    const folder = document.createElement('div');
    folder.className = 'list-group-item fw-bold';
    folder.textContent = '📁 ' + name;
    folder.style.cursor = 'pointer';

    const sub = document.createElement('div');
    sub.style.display = 'none';
    sub.style.marginLeft = '20px';

    folder.onclick = function () {

      if (sub.style.display === 'none') {

        if (!sub.dataset.loaded) {
          load(fullPath, sub);
          sub.dataset.loaded = 'true';
        }

        sub.style.display = 'block';
        folder.textContent = '📂 ' + name;

      } else {

        sub.style.display = 'none';
        folder.textContent = '📁 ' + name;

      }
    };

    container.appendChild(folder);
    container.appendChild(sub);
  }

  // 📄 files
  if (Array.isArray(tree.files)) {

    const files = tree.files.map(f =>
      basePath ? `${basePath}/${f}` : f
    );

    for (const fileName of tree.files) {

      const fullPath = basePath ? `${basePath}/${fileName}` : fileName;

      const file = document.createElement('div');
      file.className = 'list-group-item';
      file.textContent = '📄 ' + fileName;
      file.style.cursor = 'pointer';

      file.onclick = function () {
        docViewer.open(baseFolder+fullPath, files);
      };

      container.appendChild(file);
    }
  }
}
  function load(path, container) {
    console.log('from browserUser. lang = ', lang, ' page = ', page);
    fetch(`/${lang}/${page}/ls?path=` + encodeURIComponent(path))
      .then(r => r.json())
      .then(data => render(data, path, container))
      .catch(err => console.error(err));
  }

  // INITIAL LOAD
  load('', browser);

});