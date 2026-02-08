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
      });

      browser.appendChild(item);
    });

  } catch (error) {
    console.error('Error fetching file list:', error);
  }
}
