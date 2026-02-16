function renderGallery(folderPath, thumbs, containerId ) {
  const gallery = document.getElementById(containerId);
  gallery.innerHTML = '';
  const parts = folderPath.split('/');
  const lastFolderName = parts[parts.length - 1];
  // 🔹 Create heading
  const heading = document.createElement('h2');
  heading.className = 'mb-4';
  heading.textContent = lastFolderName;
  //gallery.appendChild(heading);
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
    gallery.appendChild(img);
  });
}
async function loadGallery(folderPath, containerId) {
   if (containerId.startsWith('inText')) {
    if (currentGallery === containerId) {
      const current = document.getElementById(containerId);
      if (current) {
        current.classList.add('d-none');
        current.innerHTML = '';
      }
      currentGallery = null;
      return true;
    }
      }
      if (currentGallery && currentGallery !== containerId) {
        const prev = document.getElementById(currentGallery);
        if (prev) {
          prev.classList.add('d-none');
          prev.innerHTML = '';
        }
      }
    const res = await fetch(
        '/en/events/thumbs?path=' + encodeURIComponent(folderPath)
      );
      const data = await res.json();
      if (!data.isGallery) {
      document.getElementById(containerId).innerHTML = '';
      return false;
    }
    const container = document.getElementById(containerId);
    if (!container.classList.contains('laptopGallery')) {
      container.classList.add('laptopGallery');
    }
    container.classList.remove('d-none');
    currentGallery = containerId;
    renderGallery(folderPath, data.thumbs, containerId);
    return true;
}


  