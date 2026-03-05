window.openEditorFolder = function (path, parentContainer = null) {
 const container = parentContainer || document.getElementById('editorMediaContainer');
  if(path=='conten'){
    fetch(`/admin/conten/ls`)
      .then(r => r.json())
      .then(tree => renderContentTree(tree, '', container));
  }else{
    fetch(`/en/events/ls`)
      .then(r => r.json())
      .then(tree => renderTree(tree, '', container));
  }
};
const openEventFolder = function(path, parentContainer){
  const container = parentContainer || document.getElementById('editorMediaContainer');
  fetch(`/en/events/ls?path=` +
      encodeURIComponent(path))
      .then(r => r.json())
      .then(tree => renderTree(tree, path, container));
}
const openContentFolder = function(path, parentContainer){
  const container = parentContainer || document.getElementById('editorMediaContainer');
  fetch(`/admin/conten/ls?path=` +
      encodeURIComponent(path))
      .then(r => r.json())
      .then(tree => renderContentTree(tree, path, container));
}
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
          openEventFolder(fullPath, childrenContainer);
        });
    };
    container.appendChild(folder);
    container.appendChild(childrenContainer);
  }
}
function renderContentTree(tree, basePath, container) {
  for (const name in tree) {
    if(name == 'thumbs'){
      const pathForGallery = basePath.substring('events/'.length);
      fetch(`/en/events/thumbs?path=` + encodeURIComponent(pathForGallery))
        .then(r => r.json())
        .then(data => {
            renderGalleryForEditor(pathForGallery, data.thumbs, childrenContainer);
            return;
          });
  }
if (tree.files && Array.isArray(tree.files)) {
  tree.files.forEach(file => {

    // Only html files for link mode
    if (!file.endsWith('.html')) return;
    const filePath = basePath ? basePath + '/' + file : file;
    const fileItem = document.createElement('div');
    fileItem.className = 'editorFileItem';
    fileItem.textContent = '📄 ' + file;
    fileItem.style.cursor = 'pointer';
    fileItem.onclick = function () {
      if (browserMode === 'link') {
        const linkInput = document.querySelector('.tox-dialog input.tox-textfield');
        if (linkInput) { 
          linkInput.value = '/content/' + filePath;
          linkInput.dispatchEvent(new Event('input', { bubbles: true }));
          closeEditorMedia();
        }
      }
    };
    container.appendChild(fileItem);
  });
}
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
      openContentFolder(fullPath, childrenContainer);
    };
    container.appendChild(folder);
    container.appendChild(childrenContainer);
  }
}