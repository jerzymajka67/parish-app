async function fetchFileList(route) {
  try {
    const response = await fetch(route);
    const files = await response.json();

    const browser = document.getElementById('browser');
    browser.innerHTML = '';

    files.forEach(function (file) {
      const item = document.createElement('a');
      item.href = '#';
      item.className = 'list-group-item list-group-item-action';
      item.textContent = file;

      item.addEventListener('click', function (e) {
        e.preventDefault();

        // selection UI
        browser
          .querySelectorAll('.active')
          .forEach(function (el) {
            el.classList.remove('active');
          });
        item.classList.add('active');

        // fill forms (keep your existing behavior)
        document.getElementById('delete-file-name').value = file;
        document.getElementById('publishEN').value = file;
        document.getElementById('publishES').value = file;

        // OPEN EDITOR
        openFileInEditor(file);
      });

      browser.appendChild(item);
    });

  } catch (error) {
    console.error('Error fetching file list:', error);
  }
}
async function openFileInEditor(fileName) {
  
  try {
    const response = await fetch(
      '/admin/home/file?fileName=' + encodeURIComponent(fileName)
    );

    const data = await response.json();
    const html = data.content || '';

    // extract body (same idea you already use)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const bodyContent = doc.body ? doc.body.innerHTML : '';

    // open modal
    const editModal = new bootstrap.Modal(
      document.getElementById('editHtmlModal')
    );
    editModal.show();

    // init editor
    setTimeout(function () {
      tinymce.remove('#editor');

      tinymce.init({
        selector: '#editor',
        height: 500,
        plugins: 'link image code',
        toolbar:
          'undo redo | bold italic | alignleft aligncenter alignright | link image | code',
        setup: function (editor) {
          editor.on('init', function () {
            editor.setContent(bodyContent, { format: 'raw' });
          });
        }
      });
    }, 200);

  } catch (err) {
    console.error('Failed to open file:', err);
  }
}