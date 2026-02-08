

// ---------- STATE ----------
let selectedItem = null;
let currentDraft = null;
let undoTempFile = null;
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
// ---------- OPEN EDITOR ----------
async function openFileInEditor(fileName) {
  const res = await fetch(
    '/admin/home/edit?fileName=' + encodeURIComponent(fileName)
  );

  if (res.redirected) {
    window.location.href = res.url;
    return;
  }

  const data = await res.json();

  originalFile = data.original;
  currentDraft = data.path;
  undoTempFile = data.undo || null;

  editModal.show();

  setTimeout(() => {
    tinymce.remove('#editor');
    tinymce.init({
      selector: '#editor',
      height: 520,
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
  const undoBtn = document.getElementById('undoBtn');
  const saveExitBtn = document.getElementById('saveExitBtn');
  const exitNoSaveBtn = document.getElementById('exitNoSaveBtn');

  if (saveBtn) {
    saveBtn.onclick = async () => {
      const content = tinymce.get('editor').getContent();

      const res = await fetch('/admin/home/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: currentDraft,
          content,
          undo: undoTempFile
        })
      });

      if (res.redirected) {
        window.location.href = res.url;
        return;
      }

      const data = await res.json();
      if (data.ok) {
        undoTempFile = data.undo;
        showEditorMessage(data.msg, 'success');
      }
    };
  }

  if (undoBtn) {
    undoBtn.onclick = async () => {
      if (!currentDraft || !undoTempFile) return;

      const res = await fetch('/admin/home/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: currentDraft,
          undo: undoTempFile
        })
      });

      const data = await res.json();
      if (data.ok) {
        tinymce.get('editor').setContent(data.content, { format: 'raw' });
        showEditorMessage('Reverted to previous saved version', 'info');
      }
    };
  }

  if (saveExitBtn) {
    saveExitBtn.onclick = async () => {
      const content = tinymce.get('editor').getContent();

      const res = await fetch('/admin/home/save-exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: currentDraft,
          undo: undoTempFile,
          content
        })
      });

      window.location.href = res.url;
    };
  }

  if (exitNoSaveBtn) {
    exitNoSaveBtn.onclick = async () => {
      const res = await fetch('/admin/home/exit-no-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: currentDraft,
          undo: undoTempFile
        })
      });

      window.location.href = res.url;
    };
  }
});

// ---------- UI FEEDBACK ----------
function showEditorMessage(msg, status) {
  const box = document.getElementById('editor-feedback');
  if (!box) return;

  box.textContent = msg;
  box.className = `alert alert-${status}`;
  box.classList.remove('d-none');

  setTimeout(() => box.classList.add('d-none'), 3000);
}