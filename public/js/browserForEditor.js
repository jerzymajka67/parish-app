window.openEditorFolder = function (path = '', parentContainer = null) {

  const container =
    parentContainer ||
    document.getElementById('editorMediaContainer');

  const lang =
    document.documentElement.lang || 'en';

  fetch(`/${lang}/events/ls?path=` +
    encodeURIComponent(path))
    .then(r => r.json())
    .then(tree => renderTree(tree, path, container));
};


function renderTree(tree, basePath, container) {

  for (const name in tree) {

    if (name === 'files') continue;
    if (name === 'thumbs') continue;

    const fullPath =
      basePath ? basePath + '/' + name : name;

    const folder = document.createElement('div');
    folder.className = 'editorFolderItem';
    folder.textContent = '📁 ' + name;
    folder.style.cursor = 'pointer';

    const childrenContainer = document.createElement('div');
    childrenContainer.style.marginLeft = '20px';
    childrenContainer.style.display = 'none';

    folder.onclick = function () {

      // TOGGLE behavior
      if (childrenContainer.style.display === 'block') {
        childrenContainer.style.display = 'none';
        childrenContainer.innerHTML = '';
        return;
      }

      childrenContainer.style.display = 'block';

      // First check if gallery
      const lang =
        document.documentElement.lang || 'en';

      fetch(`/${lang}/events/thumbs?path=` +
        encodeURIComponent(fullPath))
        .then(r => r.json())
        .then(data => {

          if (data.isGallery) {
            renderGalleryForEditor(fullPath, data.thumbs, childrenContainer);
            return;
          }

          openEditorFolder(fullPath, childrenContainer);
        });
    };

    container.appendChild(folder);
    container.appendChild(childrenContainer);
  }
}