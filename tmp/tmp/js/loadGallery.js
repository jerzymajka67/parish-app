function renderGallery(container, folderPath, thumbs) {
  container.innerHTML = '';
  // 🔹 Extract last folder name
  const parts = folderPath.split('/');
  const lastFolderName = parts[parts.length - 1];
  // 🔹 Create heading
  const heading = document.createElement('h2');
  heading.className = 'mb-4';
  heading.textContent = lastFolderName;
  container.appendChild(heading);
  // 🔹 Prepare full image paths for Viewer
  const galleryPaths = thumbs.map(file =>
    `/content/events/${folderPath}/${file}`
  );
  Viewer.setGallery(galleryPaths);
  // 🔹 Render thumbnails
  thumbs.forEach((file, index) => {
    const img = document.createElement('img');
    img.src = `/content/events/${folderPath}/thumbs/${file}`;
    img.onclick = () => Viewer.open(index);
    container.appendChild(img);
  });
}
async function loadGallery(folderPath, container = null) {

  const res = await fetch(
    '/en/events/thumbs?path=' + encodeURIComponent(folderPath)
  );

  const data = await res.json();

  if (!data.isGallery) {
    if (container) container.innerHTML = '';
    return false;
  }

  // If container explicitly passed → use it
  if (container) {
    renderGallery(container, folderPath, data.thumbs);
    return true;
  }

  // Otherwise use global responsive containers
  const isMobile = window.innerWidth <= 768;

  const targetContainer = isMobile
    ? document.getElementById('galleryMobile')
    : document.getElementById('gallery');

  if (!targetContainer) return false;

  targetContainer.innerHTML = '';

  renderGallery(targetContainer, folderPath, data.thumbs);

  return true;
}

function renderGalleryInto(container, folderPath, thumbs) {
  container.innerHTML = '';
  // 🔹 Extract last folder name
  const parts = folderPath.split('/');
  const lastFolderName = parts[parts.length - 1];
  // 🔹 Heading
  const heading = document.createElement('h5');
  heading.className = 'mt-2 mb-2';
  heading.textContent = lastFolderName;
  container.appendChild(heading);
  // 🔹 Prepare Viewer paths
  const galleryPaths = thumbs.map(file =>
    `/content/events/${folderPath}/${file}`
  );
  Viewer.setGallery(galleryPaths);
  // 🔹 Grid
  const grid = document.createElement('div');
  grid.className = 'row g-0';   // no spacing between columns
  thumbs.forEach((file, index) => {
    const col = document.createElement('div');
    col.className = 'col-4 p-1';   // 3 per row
    const wrapper = document.createElement('div');
    wrapper.className = 'thumb-wrapper';
    const img = document.createElement('img');
    img.src = `/content/events/${folderPath}/thumbs/${file}`;
    img.className = 'thumb-img';
    img.style.cursor = 'pointer';
    img.onclick = () => Viewer.open(index);
    wrapper.appendChild(img);  // image inside wrapper
    col.appendChild(wrapper);  // wrapper inside column
    grid.appendChild(col);     // column inside grid
  });
  container.appendChild(grid);
}
