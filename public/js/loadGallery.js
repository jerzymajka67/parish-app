function renderGallery(folderPath, thumbs) {

  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  // 🔹 Extract last folder name
  const parts = folderPath.split('/');
  const lastFolderName = parts[parts.length - 1];

  // 🔹 Create heading
  const heading = document.createElement('h2');
  heading.className = 'mb-4';
  heading.textContent = lastFolderName;

  gallery.appendChild(heading);

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
  async function loadGallery(folderPath) {
    const res = await fetch(
      '/en/events/thumbs?path=' + encodeURIComponent(folderPath)
    );
    const data = await res.json();
    if (!data.isGallery) {
      document.getElementById('gallery').innerHTML = '';
      return false;
    }
    renderGallery(folderPath, data.thumbs);
    return true;
  }
  