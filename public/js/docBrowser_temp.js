
function render(tree, router, basePath, container) {
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
                        load(fullPath, router, collapse);
                    }
                    bs.toggle();
                    };
                    container.append(item, collapse);
                }
            }
        }
    }

function load(path, router, container) {
      fetch(`${router}?path=` + encodeURIComponent(path))
      .then(r => r.json())
      .then(data => render(data, router, path, container))
      .catch(err => console.error(err));
  }
