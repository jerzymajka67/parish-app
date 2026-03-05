(function () {

  const form = document.getElementById('deleteSelectedForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    const files = [...document.querySelectorAll('input[name="files[]"]:checked')]
      .map(cb => cb.value);

    let folder = null;

    if (!files.length && window.selectedItem && window.selectedItem.tagName === 'A') {
      folder = document.querySelector('#deleteSelectedForm input[name="currentPath"]').value;
    }

    if (!files.length && !folder) {
      e.preventDefault();
      alert('No file selected');
      return;
    }

    form.querySelector('[name="files"]').value = JSON.stringify(files);
    form.querySelector('[name="folder"]').value = folder || '';

  });

})();