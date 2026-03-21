// imageViewer.js (Bulletins)
(function () {

  let files = [];
  let index = 0;

  let isZoomActive = false;
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
    if (!img || !files.length) return;

    exitZoom();
    img.src = '/' + files[index];
  }

  function enterZoom() {
    const img = getImage();
    const modalContent = getModalContent();

    isZoomActive = true;

    document.body.classList.add("zoom-active");
    modalContent.classList.add("zoom-mode");
    img.classList.add("zoom-fullscreen");

    img.style.transform = "translate(0px, 0px) scale(2)";
  }

  function exitZoom() {
    const img = getImage();
    const modalContent = getModalContent();

    isZoomActive = false;
    isDragging = false;
    dragMoved = false;
    translateX = 0;
    translateY = 0;

    document.body.classList.remove("zoom-active");
    modalContent.classList.remove("zoom-mode");
    img.classList.remove("zoom-fullscreen");

    img.style.transform = "scale(1)";
  }

  window.imageViewer = {

    open(filePath, fileList = []) {
      files = fileList;
      index = fileList.indexOf(filePath);

      if (index === -1) index = 0;

      showImage();
      showModal();
    },

    close() {
      exitZoom();
      hideModal();
    },

    next() {
      if (index < files.length - 1) {
        index++;
        showImage();
      }
    },

    prev() {
      if (index > 0) {
        index--;
        showImage();
      }
    }
  };

  document.addEventListener("DOMContentLoaded", function () {

    const img = getImage();
    const modalContent = getModalContent();

    if (!img || !modalContent) return;

    img.setAttribute("draggable", "false");
    img.addEventListener("dragstart", e => e.preventDefault());

    /* =========================
       DESKTOP
    ========================= */

    if (!('ontouchstart' in window)) {

      img.addEventListener("click", function () {
        if (!isZoomActive) {
          enterZoom();
        } else if (!dragMoved) {
          exitZoom();
        }
        dragMoved = false;
      });

      img.addEventListener("mousedown", function (e) {
        if (!isZoomActive) return;

        e.preventDefault();

        isDragging = true;
        dragMoved = false;

        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
      });

      document.addEventListener("mousemove", function (e) {
        if (!isDragging || !isZoomActive) return;

        dragMoved = true;

        translateX = e.clientX - startX;
        translateY = e.clientY - startY;

        img.style.transform =
          `translate(${translateX}px, ${translateY}px) scale(2)`;
      });

      document.addEventListener("mouseup", function () {
        isDragging = false;
      });

    }

    /* =========================
       MOBILE
    ========================= */

    if ('ontouchstart' in window) {

      let touchStartX = 0;
      let initialDistance = 0;
      let scale = 1;
      let isZooming = false;

      img.addEventListener("touchstart", e => {

        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
        }

        if (e.touches.length === 2) {
          isZooming = true;
        }

      });

      img.addEventListener("touchend", e => {

        if (isZooming) {
          isZooming = false;
          return;
        }

        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 60) {
          if (diff > 0) {
            imageViewer.next();
          } else {
            imageViewer.prev();
          }
        }

      });

      img.addEventListener("touchmove", e => {

        if (e.touches.length === 2) {

          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (!initialDistance) {
            initialDistance = distance;
          } else {

            scale = distance / initialDistance;
            scale = Math.min(Math.max(scale, 1), 4);

            img.style.transform = `scale(${scale})`;
          }

          e.preventDefault();
        }

      });

      img.addEventListener("touchend", () => {
        initialDistance = 0;
      });

    }

    /* ESC */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        imageViewer.close();
      }
    });

  });

})();