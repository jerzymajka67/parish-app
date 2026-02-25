// ---------- STATE ----------
let draftFile = null;
let originalFile = null;
let editModal = null;
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
          <div id="eventsPickerPanel" style="display:none;">
            <div id="browserForEditor"></div>
            <div id="galleryForEditor"></div>
          </div>
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
// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  initEditor();
  initEditButton();
  initSaveButtons();
});

// ---------- MODAL ----------
function initEditor() {
  console.log('Initializing editor for page:', window.ADMIN_PAGE);
  const modalEl = document.getElementById('editHtmlModal');
  if (!modalEl) return;
  editModal = new bootstrap.Modal(modalEl, {
    backdrop: 'static',
    keyboard: false,
    focus: false,
    file_picker_types: 'image',
    file_picker_callback: function (callback, value, meta) {
    if (meta.filetype !== 'image') return;
      openEventsPickerForEditor(callback);
    },
  });
}

// ---------- EDIT BUTTON ----------
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

// ---------- OPEN EDITOR ----------
async function openFileInEditor(fileName) {
  const res = await fetch(
    '/admin/' + window.ADMIN_PAGE + '/edit?fileName=' + encodeURIComponent(fileName)
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
    tinymce.remove();
    tinymce.init({
      selector: '#editor',
      license_key: 'gpl',
      toolbar: 'image',
      promotion: false,
      branding: false,
      height: '100%',
      relative_urls: false,
      remove_script_host: false,
      convert_urls: false,
      menubar: 'edit insert view format tools',
      plugins: [
        'link',
        'code',
        'fullscreen',
        'lists',
        'table',
        'preview'
      ],
      toolbar: `
      undo redo | eventImage |
      bold italic underline |
      alignleft aligncenter alignright |
      bullist numlist table |
      link code |
      fullscreen preview
    `,

      /* -------------------------
        LINK CONFIGURATION
      -------------------------- */
      link_default_target: '_self',
      link_context_toolbar: true,
      link_assume_external_targets: true,

      /* -------------------------
        IMAGE UPLOAD CONFIG
      -------------------------- */
      automatic_uploads: true,
      images_upload_url: '/admin/' + window.ADMIN_PAGE + '/upload-image',
      images_reuse_filename: true,
      file_picker_types: 'image',

      image_title: true,

      /* -------------------------
        CONTENT STYLE (editor view)
      -------------------------- */
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

      /* -------------------------
        INITIAL CONTENT
      -------------------------- */
      setup(editor) {
        editor.on('init', () => {
          editor.setContent(data.content, { format: 'raw' });
         });
        editor.ui.registry.addButton('eventImage', {
            icon: 'image',
            tooltip: 'Insert Event Image',
            onAction: function () {
              const panel =
              document.getElementById('eventsPickerPanel');
              panel.style.display = 'block';
              initBrowserForEditor(); 
            }
        });
      }
    });
  }, 150);
}
// ---------- SAVE BUTTONS ----------
function initSaveButtons() {
  const saveBtn = document.getElementById('saveOnlyBtn');
  const saveExitBtn = document.getElementById('saveExitBtn');

  if (saveBtn) {
    saveBtn.onclick = () => saveFile('/admin/' + window.ADMIN_PAGE + '/save');
  }

  if (saveExitBtn) {
    saveExitBtn.onclick = () => saveExitFile('/admin/' + window.ADMIN_PAGE + '/save-exit');
  }
}
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
    // Server performed res.redirect(...)
    window.location.href = res.url;
    return;
  }

  if (!res.ok) {
    console.error("Save & Exit failed");
    alert("Save & Exit failed");
  }
}


