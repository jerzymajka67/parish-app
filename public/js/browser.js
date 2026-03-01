document.addEventListener('DOMContentLoaded', function () {
  let browser = document.getElementById('browser');
    if (!browser) {
      browser = document.createElement('div');
      browser.id = 'browser';
      browser.style.display = 'none';
      browser.setAttribute('aria-hidden', 'true');
      document.body.appendChild(browser);
    }
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
        if (isGallery) {
          return;
        }
        if (!collapse.hasChildNodes()) {
          load(fullPath, collapse);
        }
        bs.toggle();
      };
      container.append(folder, collapse);
    }
  }
  function load(path, container) {
    const lang =
      document.documentElement.lang || 'en';
    fetch(`/${lang}/events/ls?path=` +
      encodeURIComponent(path))
      .then(r => r.json())
      .then(data => render(data, path, container))
      .catch(err => console.error(err));
  }
  /* INITIAL LOAD */
  const lang =
    document.documentElement.lang || 'en';
  fetch(`/${lang}/events/ls`)
    .then(r => r.json())
    .then(data => render(data, '', browser))
    .catch(err => console.error(err));

});
