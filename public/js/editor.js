let draftFile = null;
let originalFile = null;
let editModal = null;
let galleryDialog = null;
let browserMode = 'image';
const insertGallery = function (text, folderPath) {
  const editor = tinymce.get('editor');
  const galleryId = folderPath
    .replace(/\s+/g, '_')
    .replace(/[^\w]/g, '_');
  const html = `
    <div class="gallery-block my-4">
      <p>
        <a href="#"
           onclick="loadGallery('${folderPath}', '${galleryId}'); return false;">
           ${text}
        </a>
      </p>
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-7">
            <div id="${galleryId}" class="laptopGallery g-3 mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  editor.insertContent(html);
};
const openImageBrowser = function () {
  browserMode = 'image';
  openEditorMedia('photos');
}
const openLinkBrowser = function() {
  browserMode = 'link';
  openEditorMedia('conten');
}
const openGalleryBrowser = function() {
  browserMode = 'gallery';
  openEditorMedia('photos');
}
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
function initEditorModal() {
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
        extended_valid_elements: 'a[href|onclick]',
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
          'lists',
          'table',
          'code',
          'preview',
          'fullscreen'
        ],
        toolbar: `
          undo redo |
          bold italic underline |
          alignleft aligncenter alignright |
          bullist numlist table |
          eventImage link  insertGallery |
          code preview fullscreen 
        `,
        /* ---------------- LINK CONFIGURATION ---------------- */
        link_default_target: '_self',
        link_context_toolbar: true,
                /* Enable internal file browsing inside link dialog */
        file_picker_types: 'file',
        file_picker_callback: function (callback, value, meta) {
          if (meta.filetype === 'file') {
             openLinkBrowser();
          }
        },
        /* ---------------- EDITOR STYLING ---------------- */
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
              openImageBrowser();  
            }
          });
          //Future-ready gallery button (optional, can keep commented) 
          editor.ui.registry.addButton('insertGallery', {
            text: 'Gallery',
            onAction: function () {
              galleryDialog = editor.windowManager.open({
                title: 'Insert Gallery',
                body: {
                  type: 'panel',
                      items: [
                        {
                          type: 'input',
                          name: 'linkText',
                          label: 'Text to display'
                        },
                        {
                          type: 'input',
                          name: 'folderPath',
                          label: 'Gallery folder'
                        },
                        {
                          type: 'button',
                          name: 'browseGallery',
                          text: 'Browse...',
                          primary: false
                        }
                      ]
                    },
                    buttons: [
                      { type: 'cancel', text: 'Cancel' },
                      { type: 'submit', text: 'Insert', primary: true }
                    ],
                onAction: function (api, details) {
                  if (details.name === 'browseGallery') {
                     openGalleryBrowser();
                  } },
                onSubmit: function (api) {
                  const data = api.getData();
                  insertGallery(data.linkText, data.folderPath)
                  api.close();
                }
              });
            }
          });
        }
      });
  }, 150);
}
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
    window.location.href = res.url;
    return;
  }
  if (!res.ok) {
    console.error("Save & Exit failed");
    alert("Save & Exit failed");
  }
}