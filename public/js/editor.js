/* =========================================================
   STATE
========================================================= */

let draftFile = null;
let originalFile = null;
let editModal = null;


/* =========================================================
   CREATE EDITOR MODAL HTML (ONLY ONCE)
========================================================= */

function editorHTML() {

  if (document.getElementById('editHtmlModal')) return;

  const modalHtml = `
    <div class="modal fade" id="editHtmlModal" tabindex="-1">
      <div class="modal-dialog modal-fullscreen">
        <div class="modal-content">

          <div class="modal-header">
            <h5 id="editorTitle" class="modal-title"></h5>
          </div>

          <div class="modal-body p-0 d-flex" style="height:100%;">
            <div style="flex:1;">
              <textarea id="editor"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button id="saveOnlyBtn" type="button" class="btn btn-success">
              Save
            </button>

            <button id="saveExitBtn"
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal">
              Save & Exit
            </button>
          </div>

        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}


/* =========================================================
   INIT ON DOM READY
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  editorHTML();          // Ensure modal HTML exists
  initEditorModal();     // Bootstrap modal
  initEditButton();      // "Edit" button
  initSaveButtons();     // Save buttons

});


/* =========================================================
   INITIALIZE BOOTSTRAP MODAL (ONLY ONCE)
========================================================= */

function initEditorModal() {
  console.log('eitor init');
  const modalEl = document.getElementById('editHtmlModal');
  if (!modalEl) return;

  if (!editModal) {
    editModal = new bootstrap.Modal(modalEl, {
      backdrop: 'static',
      keyboard: false,
      focus: false
    });
  }
}


/* =========================================================
   EDIT BUTTON
========================================================= */

function initEditButton() {

  const editBtn = document.getElementById('editBtn');
  if (!editBtn) return;

  editBtn.addEventListener('click', () => {

    if (!window.selectedFile) {
      alert('No file selected');
      return;
    }

    openFileInEditor(window.selectedFile);
  });
}


/* =========================================================
   OPEN FILE IN EDITOR
========================================================= */

async function openFileInEditor(fileName) {

  const res = await fetch(
    '/admin/' + window.ADMIN_PAGE + '/edit?fileName=' +
    encodeURIComponent(fileName)
  );

  if (res.redirected) {
    window.location.href = res.url;
    return;
  }

  const data = await res.json();

  originalFile = data.originalFile;
  draftFile = data.draftFile;

  const titleEl = document.getElementById('editorTitle');
  if (titleEl) {
    titleEl.textContent =
      `Editing: Your file ${originalFile} will be saved as ${draftFile}`;
  }

  editModal.show();

  setTimeout(() => {

    /* Prevent double Tiny initialization */
    if (tinymce.get('editor')) {
      tinymce.get('editor').remove();
    }

    tinymce.init({
      selector: '#editor',
      license_key: 'gpl',
      promotion: false,
      branding: false,
      height: '100%',

      relative_urls: false,
      remove_script_host: false,
      convert_urls: false,

      menubar: 'edit insert view format',

      plugins: [
        'link',
        'code',
        'fullscreen',
        'lists',
        'table',
        'preview'
      ],

      toolbar: `
        undo redo |
        bold italic underline |
        alignleft aligncenter alignright |
        bullist numlist table |
        eventImage link code |
        fullscreen preview
      `,

      /* Link configuration */
      link_default_target: '_self',
      link_context_toolbar: true,
      link_assume_external_targets: true,

      /* Image upload configuration */
      automatic_uploads: true,
      images_upload_url:
        '/admin/' + window.ADMIN_PAGE + '/upload-image',
      images_reuse_filename: true,
      image_title: true,

      /* Editor content styling */
      content_style: `
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          padding: 1.5rem;
        }

        h1, h2, h3 {
          margin-top: 1.5rem;
        }

        img {
          max-width: 100%;
          height: auto;
        }
      `,

      setup(editor) {

        editor.on('init', () => {
          editor.setContent(data.content, { format: 'raw' });
        });

        /* Custom image button */
        editor.ui.registry.addButton('eventImage', {
          icon: 'image',
          tooltip: 'Insert Event Image',
          onAction: function () {
            openEditorMedia();  // Your new modal system
          }
        });

      }
    });

  }, 150);
}


/* =========================================================
   SAVE BUTTONS
========================================================= */

function initSaveButtons() {

  const saveBtn = document.getElementById('saveOnlyBtn');
  const saveExitBtn = document.getElementById('saveExitBtn');

  if (saveBtn) {
    saveBtn.onclick = () =>
      saveFile('/admin/' + window.ADMIN_PAGE + '/save');
  }

  if (saveExitBtn) {
    saveExitBtn.onclick = () =>
      saveExitFile('/admin/' + window.ADMIN_PAGE + '/save-exit');
  }
}


/* =========================================================
   SAVE
========================================================= */

async function saveFile(url) {

  const content = tinymce.get('editor').getContent();

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      draftFile,
      originalFile,
      content
    })
  });

  if (res.ok) {

    const title = document.getElementById('editorTitle');
    if (!title) return;

    const old = title.textContent;
    title.textContent = old + " — Saved ✔";

    setTimeout(() => {
      title.textContent = old;
    }, 1500);

  } else {
    console.error("Save failed");
    alert("Save failed");
  }
}


/* =========================================================
   SAVE & EXIT
========================================================= */

async function saveExitFile(url) {

  const content = tinymce.get('editor').getContent();

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      draftFile,
      originalFile,
      content
    })
  });

  if (res.redirected) {
    window.location.href = res.url;
    return;
  }

  if (!res.ok) {
    console.error("Save & Exit failed");
    alert("Save & Exit failed");
  }
}