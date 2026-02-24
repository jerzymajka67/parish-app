function initFileBrowser(page) {
  const baseUrl = '/admin/' + page;

  const browser = document.getElementById('browser');
  const createPath = document.querySelector('#createFolderForm input[name="currentPath"]');
  const uploadPath = document.querySelector('#uploadFileForm input[name="currentPath"]');
  const createHtmlPath = document.querySelector('#createHtmlForm input[name="currentPath"]');
  const deletePath = document.querySelector('#deleteSelectedForm input[name="currentPath"]');
  const rootInfo = document.getElementById('root-folder');
  const deleteName = document.getElementById('delete-folder-name');
  const deleteBtn = document.getElementById('deleteBtn');
  const uploadBtn = document.getElementById('uploadBtn');

  if (!browser) return;

  // Only global needed by delete system
  window.selectedItem = null;

  function setCurrent(path) {
    window.selectedFile = path;
    if (createPath) createPath.value = path;
    if (uploadPath) uploadPath.value = path;
    if (deletePath) deletePath.value = path;
    if (createHtmlPath) createHtmlPath.value = path;
    if (rootInfo) rootInfo.value = 'In: ' + (path || '/');
    if (deleteName) deleteName.value = path.split('/').pop() || '';
    if (deleteBtn) deleteBtn.disabled = !path;
    if (uploadBtn) uploadBtn.disabled = !path;
  }

  function select(el, path) {
    window.selectedItem?.classList.remove('active');
    window.selectedItem = el;
    el.classList.add('active');
    setCurrent(path);
  }
  function render(tree, basePath, container) {

    for (const name in tree) {
      if (name === 'files') continue;
      const fullPath = basePath ? basePath + '/' + name : name;
      const folder = document.createElement('a');
      folder.href = '#';
      folder.className = 'list-group-item list-group-item-action';
      folder.textContent = name;
      const collapse = document.createElement('div');
      collapse.className = 'collapse ps-3';
      const bs = new bootstrap.Collapse(collapse, { toggle: false });
      folder.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        select(folder, fullPath);
        if (!collapse.hasChildNodes()) {
          load(fullPath, collapse);
        }
        bs.toggle();
      };
      container.append(folder, collapse);
    }
    (tree.files || []).forEach(file => {
      const filePath = basePath ? basePath + '/' + file : file;
      const item = document.createElement('div');
      item.className = 'list-group-item d-flex align-items-center gap-2';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.name = 'files[]';
      cb.value = filePath;
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = file;
        link.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof docViewer !== 'undefined') {
          docViewer.open('content/' + window.ADMIN_PAGE + '/' + filePath);
        }
      };
      item.append(cb, link);
      item.onclick = () => select(item, filePath);
      container.appendChild(item);
    });
  }

  function load(path, container) {
    fetch(baseUrl + '/ls?path=' + encodeURIComponent(path))
      .then(r => r.json())
      .then(data => render(data, path, container))
      .catch(err => console.error('Load error:', err));
  }

  // Initial load
  fetch(baseUrl + '/ls')
    .then(r => r.json())
    .then(data => render(data, '', browser))
    .catch(err => console.error('Initial load error:', err));
}