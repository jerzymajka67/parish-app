document.addEventListener('DOMContentLoaded', function () {

  const page = window.USER_PAGE;
  const lang = document.documentElement.lang || 'en';

  let browser = document.getElementById('browser');
  if (!browser) return;

  /* ================================
     PHOTOS PAGE
  ================================= */

  if (page === "photos" || page === "fotos") {

    function render(tree, basePath, container) {

      for (const name in tree) {

        if (name === 'files') continue;
        if (name === 'thumbs') continue;

        const fullPath = basePath
          ? basePath + '/' + name
          : name;

        const folder = document.createElement('a');

        folder.href = '#';

        folder.className =
          'list-group-item list-group-item-action fw-bold';

        folder.textContent = '📁 ' + name;

        const collapse = document.createElement('div');

        collapse.className = 'collapse ps-3';

        collapse.id =
          'collapse-' + fullPath.replace(/[^\w]/g, '_');

        const bs = new bootstrap.Collapse(
          collapse,
          { toggle: false }
        );

        folder.onclick = async function (e) {

          e.preventDefault();
          e.stopPropagation();

          let targetContainerId;

          if (window.innerWidth < 768) {
            targetContainerId = collapse.id;
            bs.show();
          } else {
            targetContainerId = 'gallery';
          }

          const isGallery =
            await loadGallery(fullPath, targetContainerId);

          if (isGallery) return;

          if (!collapse.hasChildNodes()) {
            load(fullPath, collapse);
          }

          bs.toggle();

        };

        container.append(folder, collapse);

      }
    }

    function load(path, container) {

      fetch(`/${lang}/photos_files/ls?path=` +
        encodeURIComponent(path))
        .then(r => r.json())
        .then(data => render(data, path, container))
        .catch(err => console.error(err));

    }

    fetch(`/${lang}/photos_files/ls`)
      .then(r => r.json())
      .then(data => render(data, '', browser))
      .catch(err => console.error(err));

    return;
  }

  /* ================================
     DOCUMENT / FILE PAGES
  ================================= */

  const baseFolder = `content/${page}_files/${lang}/`;

  function render(tree, basePath, container) {

    container.innerHTML = '';

    for (const name in tree) {

      if (name === 'files') continue;

      const fullPath =
        basePath
        ? `${basePath}/${name}`
        : name;

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

    if (Array.isArray(tree.files)) {

      const files = tree.files.map(f =>
        basePath
          ? `${baseFolder}/${basePath}/${f}`
          : `${baseFolder}/${f}`
      );

      for (const fileName of tree.files) {

        const fullPath =
          basePath
            ? `${baseFolder}/${basePath}/${fileName}`
            : `${baseFolder}/${fileName}`;

        const file = document.createElement('div');

        file.className = 'list-group-item';

        file.textContent = '📄 ' + fileName;

        file.style.cursor = 'pointer';
        file.onclick = function () {
          if (page === 'bulletin') {
            imageViewer.open(fullPath, files);
          } else {
            docViewer.open(fullPath, files);
          }
        };
        container.appendChild(file);

      }

    }

  }

  function load(path, container) {

    fetch(`/${lang}/${page}/ls?path=` +
      encodeURIComponent(path))
      .then(r => r.json())
      .then(data => render(data, path, container))
      .catch(err => console.error(err));

  }

  load('', browser);

});