// viewer.js
(function () {

  let gallery = [];
  let index = 0;

  let isMagnifierActive = false;
  let isDragging = false;
  let dragMoved = false;

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

  function enterZoom() {
    const img = getImage();
    const modalContent = getModalContent();

    isMagnifierActive = true;

    document.body.classList.add("zoom-active");
    modalContent.classList.add("zoom-mode");
    img.classList.add("zoom-fullscreen");

    img.style.transform = "translate(0px, 0px) scale(2)";
  }

  function exitZoom() {
    const img = getImage();
    const modalContent = getModalContent();

    isMagnifierActive = false;
    isDragging = false;
    dragMoved = false;
    translateX = 0;
    translateY = 0;

    document.body.classList.remove("zoom-active");
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

    // Disable browser ghost drag
    img.setAttribute("draggable", "false");
    img.addEventListener("dragstart", e => e.preventDefault());

    /* ===== CLICK TO TOGGLE ZOOM ===== */
    img.addEventListener("click", function () {

      if (!isMagnifierActive) {
        enterZoom();
      } else if (!dragMoved) {
        // only close if it was a real click, not a drag
        exitZoom();
      }

      dragMoved = false;
    });

    /* ===== DRAG START ===== */
    img.addEventListener("mousedown", function (e) {
      if (!isMagnifierActive) return;

      e.preventDefault();

      isDragging = true;
      dragMoved = false;

      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
    });

    /* ===== DRAG MOVE ===== */
    document.addEventListener("mousemove", function (e) {
      if (!isDragging || !isMagnifierActive) return;

      dragMoved = true;

      translateX = e.clientX - startX;
      translateY = e.clientY - startY;

      img.style.transform =
        `translate(${translateX}px, ${translateY}px) scale(2)`;
    });

    /* ===== DRAG END ===== */
    document.addEventListener("mouseup", function () {
      isDragging = false;
    });

    /* ===== ESC CLOSES MODAL ===== */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        Viewer.close();
      }
    });

  });

})();