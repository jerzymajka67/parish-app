// REMOVE DOMContentLoaded completely

window.initBrowserForEditor = function () {
console.log('Initializing browser for editor');
  const browser = document.getElementById('browserForEditor');
  if (!browser) return;
console.log('Browser container found');
  browser.innerHTML = ''; // clear previous tree

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

      folder.onclick = async function (e) {

        e.preventDefault();

        const isGallery =
          await loadGalleryForEditor(fullPath);

        if (!isGallery) {
          load(fullPath);
        }
      };

      container.appendChild(folder);
    }
  }

  function load(path) {

    const lang =
      document.documentElement.lang || 'en';

    fetch(`/${lang}/events/ls?path=` +
      encodeURIComponent(path))
      .then(r => r.json())
      .then(data => render(data, path, browser))
      .catch(err => console.error(err));
  }

  function loadGalleryForEditor(folderPath) {

    const lang =
      document.documentElement.lang || 'en';

    return fetch(
      `/${lang}/events/thumbs?path=` +
      encodeURIComponent(folderPath)
    )
      .then(r => r.json())
      .then(data => {

        if (!data.isGallery) return false;

        renderGalleryForEditor(folderPath, data.thumbs);
        return true;
      });
  }

  function renderGalleryForEditor(folderPath, thumbs) {

    const gallery =
      document.getElementById('galleryForEditor');

    gallery.innerHTML = '';

    thumbs.forEach(name => {

      const img = document.createElement('img');

      img.src =
        `/content/events/${folderPath}/thumbs/${name}`;

      img.className = 'img-fluid';
      img.style.cursor = 'pointer';

      img.onclick = function () {

        const fullImage =
          `/content/events/${folderPath}/${name}`;

        const editor =
          tinymce.get('editor');

        editor.insertContent(
          `<img src="${fullImage}" class="img-fluid my-3 rounded" alt="">`
        );

        document.getElementById('eventsPickerPanel')
          .style.display = 'none';
      };

      gallery.appendChild(img);
    });
  }

  // initial load when called
  load('');
};