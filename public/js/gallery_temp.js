/* =========================================
   GALLERY LOGIC
========================================= */

let currentGallery = null;

/* -----------------------------------------
   Load Gallery
----------------------------------------- */

async function loadGallery(folderPath, containerId) {

  const container = document.getElementById(containerId);
  if (!container) return false;

  /* Close previous gallery (if different) */
  if (currentGallery && currentGallery !== containerId) {

    const prev = document.getElementById(currentGallery);

    if (prev) {
      prev.classList.add('d-none');
      prev.innerHTML = '';
    }
  }

  console.log('Loading gallery for:', folderPath, 'into container:', containerId);

  const lang = document.documentElement.lang || 'en';

  const res = await fetch(
    `/${lang}/events/thumbs?path=` + encodeURIComponent(folderPath)
  );

  const data = await res.json();

  if (!data.isGallery) {
    container.innerHTML = '';
    return false;
  }

  /* Ensure gallery class exists */
  if (!container.classList.contains('laptopGallery')) {
    container.classList.add('laptopGallery');
  }

  container.classList.remove('d-none');

  currentGallery = containerId;

  renderGallery(folderPath, data.thumbs, containerId);

  return true;
}

/* -----------------------------------------
   Render Gallery
----------------------------------------- */

function renderGallery(folderPath, thumbs, containerId) {

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (!thumbs || !thumbs.length) return;

  /* Prepare full image paths */
  const lang = document.documentElement.lang || 'en';

  const fullImages = thumbs.map(name =>
    `/${lang}/events/image?path=` +
    encodeURIComponent(folderPath + '/' + name)
  );

  thumbs.forEach(function (name, index) {

    const img = document.createElement('img');

    img.src =
      `/${lang}/events/thumb?path=` +
      encodeURIComponent(folderPath + '/' + name);

    img.alt = name;
    img.className = 'img-fluid';

    img.onclick = function () {
      Viewer.setGallery(fullImages);
      Viewer.open(index);
    };

    container.appendChild(img);
  });
}




//let currentGallery = null;
async function loadGallery(folderPath, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return false;
  /* Close previous gallery */
  if (currentGallery && currentGallery !== containerId) {
    const prev = document.getElementById(currentGallery);
    if (prev) {
      prev.classList.add('d-none');
      prev.innerHTML = '';
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
  if (!container.classList.contains('laptopGallery')) {
    container.classList.add('laptopGallery');
  }
  container.classList.remove('d-none');
  currentGallery = containerId;
  renderGallery(folderPath, data.thumbs, containerId);
  return true;
}
function renderGallery(folderPath, thumbs, containerId) {

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (!thumbs || !thumbs.length) return;

  /* Prepare full image paths */
  const lang = document.documentElement.lang || 'en';

  const fullImages = thumbs.map(name =>
    `/${lang}/events/image?path=` +
    encodeURIComponent(folderPath + '/' + name)
  );

  thumbs.forEach(function (name, index) {

    const img = document.createElement('img');

    img.src =
      `/${lang}/events/thumb?path=` +
      encodeURIComponent(folderPath + '/' + name);

    img.alt = name;
    img.className = 'img-fluid';

    img.onclick = function () {
      Viewer.setGallery(fullImages);
      Viewer.open(index);
    };

    container.appendChild(img);
  });
}