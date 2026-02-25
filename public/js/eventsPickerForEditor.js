/* =========================================
   EDITOR EVENTS IMAGE PICKER
========================================= */

(function () {

  let originalViewerOpen = null;
  let originalViewerSetGallery = null;
  let currentFullImages = [];

  /* -----------------------------------------
     Activate Picker Mode
  ----------------------------------------- */

  window.openEventsPickerForEditor = function (callback) {

    if (!window.Viewer) {
      console.error('Viewer not loaded');
      return;
    }

    // Save original Viewer functions
    originalViewerOpen = Viewer.open;
    originalViewerSetGallery = Viewer.setGallery;

    // Override setGallery to capture images
    Viewer.setGallery = function (images) {
      currentFullImages = images;
    };

    // Override open to insert into editor
    Viewer.open = function (index) {

      const imageUrl = currentFullImages[index];

      if (imageUrl) {
        callback(imageUrl, {
          alt: ''
        });
      }

      restoreViewer();
      closeEventsBrowser(); // your existing function
    };

    // Open your existing browser UI
    openEventsBrowser(); // your existing function
  };

  /* -----------------------------------------
     Restore Viewer
  ----------------------------------------- */

  function restoreViewer() {

    if (originalViewerOpen) {
      Viewer.open = originalViewerOpen;
    }

    if (originalViewerSetGallery) {
      Viewer.setGallery = originalViewerSetGallery;
    }

    currentFullImages = [];
  }

})();