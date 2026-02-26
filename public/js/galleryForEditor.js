/* =========================================
   EDITOR GALLERY STATE
========================================= */

let currentEditorGallery = null;


/* =========================================
   LOAD EDITOR GALLERY
========================================= */

async function loadEditorGallery(folderPath, containerId) {

  const container = document.getElementById(containerId);
  if (!container) return false;

  /* Close previously opened gallery */
  if (currentEditorGallery && currentEditorGallery !== containerId) {
    const prev = document.getElementById(currentEditorGallery);
    if (prev) {
      prev.innerHTML = '';
      prev.classList.remove('editorGalleryGrid');
    }
  }

  const lang = document.documentElement.lang || 'en';

  const res = await fetch(
    `/${lang}/events/thumbs?path=` +
    encodeURIComponent(folderPath)
  );

  const data = await res.json();

  if (!data.isGallery) {
    container.innerHTML = '';
    return false;
  }

  currentEditorGallery = containerId;

  renderGalleryForEditor(folderPath, data.thumbs, containerId);

  return true;
}


/* =========================================
   RENDER EDITOR GALLERY
========================================= */

function renderGalleryForEditor(folderPath, thumbs, container) {

  container.innerHTML = '';

  // 🔥 remove inline display override
  container.style.display = '';

  container.classList.add('editorGalleryGrid');

  thumbs.forEach(name => {

    const img = document.createElement('img');

    img.src =
      `/content/events/${folderPath}/thumbs/${name}`;

    img.style.cursor = 'pointer';

    img.onclick = function () {

      const fullImage =
        `/content/events/${folderPath}/${name}`;

      const editor =
        tinymce.get('editor');

      editor.insertContent(
        `<img src="${fullImage}" class="img-fluid my-3 rounded" alt="">`
      );

      closeEditorMedia();
    };

    container.appendChild(img);
  });
}