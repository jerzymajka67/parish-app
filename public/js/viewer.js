// viewer.js
(function () {

  let gallery = [];
  let index = 0;
  let wasDragging = false;
  let isMagnifierActive = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;

  function getModal() {
    return document.getElementById("imageModal");
  }

  function getImage() {
    return document.getElementById("modalImage");
  }

  function getModalContent() {
    return document.getElementById("modalContent");
  }

  function showModal() {
    const modalEl = getModal();
    const instance = new bootstrap.Modal(modalEl);
    instance.show();
  }

  function hideModal() {
    const modalEl = getModal();
    const instance = bootstrap.Modal.getInstance(modalEl);
    if (instance) instance.hide();
  }

  function showImage() {
    const img = getImage();
    if (!img || !gallery.length) return;
    img.src = gallery[index];
  }

  function exitZoom() {
    const img = getImage();
    const modalContent = getModalContent();

    isMagnifierActive = false;
    isDragging = false;
    translateX = 0;
    translateY = 0;
    modalContent.classList.remove("zoom-mode");
    img.classList.remove("zoom-fullscreen");

    img.style.transform = "scale(1)";
  }

  window.Viewer = {

    setGallery(arr) {
      gallery = arr || [];
    },

    open(i = 0) {
      index = i;
      showImage();
      showModal();
    },

    close() {
      exitZoom();
      hideModal();
    },

    next() {
      if (!gallery.length) return;
      index = (index + 1) % gallery.length;
      showImage();
    },

    prev() {
      if (!gallery.length) return;
      index = (index - 1 + gallery.length) % gallery.length;
      showImage();
    }
  };

  document.addEventListener("DOMContentLoaded", function () {

    const img = getImage();
    const modalContent = getModalContent();

    if (!img || !modalContent) return;

    // Disable browser ghost dragging
    img.setAttribute("draggable", "false");
    img.addEventListener("dragstart", e => e.preventDefault());

    /* ===== ENTER ZOOM ===== */
    img.addEventListener("click", function (e) {

      if (isMagnifierActive) return;

      e.stopPropagation();

      isMagnifierActive = true;

      modalContent.classList.add("zoom-mode");
      img.classList.add("zoom-fullscreen");

      img.style.transform = "translate(0px, 0px) scale(2)";
    });

    /* ===== DRAG START ===== */
    img.addEventListener("mousedown", function (e) {
      if (!isMagnifierActive) return;

      e.preventDefault();

      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
    });

    /* ===== DRAG MOVE ===== */
    document.addEventListener("mousemove", function (e) {
      if (!isDragging || !isMagnifierActive) return;

      translateX = e.clientX - startX;
      translateY = e.clientY - startY;

      img.style.transform =
        `translate(${translateX}px, ${translateY}px) scale(2)`;
    });

    /* ===== DRAG END ===== */
document.addEventListener("mouseup", function () {
  if (isDragging) {
    wasDragging = true;
  }

  isDragging = false;

  setTimeout(() => {
    wasDragging = false;
  }, 50);
});

    /* ===== EXIT ZOOM ON CLICK ===== */
document.addEventListener("click", function () {

  if (!isMagnifierActive) return;
  if (wasDragging) return;   // ignore click caused by drag

  exitZoom();
});

    /* ===== ESC CLOSES MODAL ===== */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        Viewer.close();
      }
    });

  });

})();