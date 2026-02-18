document.addEventListener('DOMContentLoaded', function () {
  const browser = document.getElementById('browser');
  function render(tree, basePath, container) {
    for (const name in tree) {
if (name === 'files' && Array.isArray(tree[name])) {

  const fileList = tree[name];

  fileList.forEach(fileName => {

    const fileItem = document.createElement('a');
    fileItem.href = '#';
    fileItem.className =
      'list-group-item list-group-item-action';

    fileItem.textContent = '📄 ' + fileName;
    const fullFilePath = 'content/' +(basePath ? basePath + '/' : '') +fileName;
    fileItem.onclick = function (e) {
      e.preventDefault();
    DocViewer.files = fileList.map(f =>
      'content/' +
      (basePath ? basePath + '/' : '') +
      f
    );
      DocViewer.open(fullFilePath);
    };

    container.appendChild(fileItem);
  });

  continue;
}

    else{
            const fullPath = basePath
                ? basePath + '/' + name
                : name;
            const value = tree[name];
            const item = document.createElement('a');
            item.href = '#';
            item.className =
                'list-group-item list-group-item-action';
        //FOLDER
            if (typeof value === 'object' && value !== null) {
                item.classList.add('fw-bold');
                item.textContent = '📁 ' + name;
                const collapse = document.createElement('div');
                collapse.className = 'collapse ps-3';
                collapse.id =
                'collapse-' + fullPath.replace(/[^\w]/g, '_');
                const bs = new bootstrap.Collapse(
                collapse,
                { toggle: false }
                );

                item.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (!collapse.hasChildNodes()) {
                    //render(value, fullPath, collapse);
                    load(fullPath, collapse);
                }
                bs.toggle();
                };
                container.append(item, collapse);
            }
        }
    }
}

function load(path, container) {
    const lang = document.documentElement.lang || 'en';
      fetch(`/${lang}/${PAGE}/ls?path=` +
      encodeURIComponent(path))
      .then(r => r.json())
      .then(data => render(data, path, container))
      .catch(err => console.error(err));
  }
//INITIAL LOAD 
  fetch(`/${LANG}/${PAGE}/ls?path=${CONTENT_ROOT}`)
    .then(r => r.json())
    .then(data => render(data, CONTENT_ROOT, browser))
    .catch(err => console.error(err));
});
