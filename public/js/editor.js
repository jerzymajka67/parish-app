// ---------- STATE ----------
let selectedItem = null;
let draftFile = null;
let originalFile = null;
let editModal = null;
function stampFileName(filename) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map(p => [p.type, p.value])
  );
  const timestamp = `${parts.year}-${parts.month}-${parts.day}_${parts.hour}-${parts.minute}`;
  // remove existing timestamp if present
  const cleanName = filename.replace(/_\d{2}-\d{2}-\d{2}_\d{2}-\d{2}(?=\.)?/g, "");
  // insert timestamp before extension (or at end if no extension)
  return cleanName.replace(
    /(\.[^./\\]+)?$/,
    `_${timestamp}$1`
  );
}
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
    console.log('Selected file success:', window.selectedFile);
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

