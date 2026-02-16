// ---------- STATE ----------
let selectedItem = null;
let draftFile = null;
let originalFile = null;
let editModal = null;
// ---------- INIT ----------
function initEditor() {
  const modalEl = document.getElementById('editHtmlModal');
  if (!modalEl) return;
    editModal = new bootstrap.Modal(modalEl, {
    backdrop: 'static',
    keyboard: false
  });
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
// ---------- OPEN EDITOR ----------
async function openFileInEditor(fileName) {
  const res = await fetch(
    '/admin/about/edit?fileName=' + encodeURIComponent(fileName)
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
  titleEl.textContent = `Editing: Your file ${originalFile} will be saved as ${draftFile}`;
}
  editModal.show();
  setTimeout(() => {
    tinymce.remove('#editor');
    tinymce.init({
      selector: '#editor',
      height: 520,
      //height: '100%',
      plugins: 'link image code',
      toolbar:
        'undo redo | bold italic | alignleft aligncenter alignright | link image | code',
      setup(editor) {
        editor.on('init', () => {
          editor.setContent(data.content, { format: 'raw' });
        });
      }
    });
  }, 150);
}
// ---------- EDITOR BUTTONS ----------
document.addEventListener('DOMContentLoaded', () => {
  initEditor();
  const saveBtn = document.getElementById('saveOnlyBtn');
  const saveExitBtn = document.getElementById('saveExitBtn');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const content = tinymce.get('editor').getContent();
      const res = await fetch('/admin/about/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftFile: draftFile,
          originalFile: originalFile,
          content
        })
      });

      if (res.redirected) {
        window.location.href = res.url;
      }
    };
  }

  if (saveExitBtn) {
    saveExitBtn.onclick = async () => {
      const content = tinymce.get('editor').getContent();
      const res = await fetch('/admin/about/save-exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftFile: draftFile,
          originalFile: originalFile,
          content
        })
      });

      window.location.href = res.url;
    };
  }
});

