function openEditorMedia(root) {
  const overlay =
    document.getElementById('editorMediaOverlay');
    overlay.classList.remove('d-none');
    openEditorFolder(root);   // ← start from root
}
function closeEditorMedia() {
  const overlay = document.getElementById('editorMediaOverlay');
  const container = document.getElementById('editorMediaContainer');
  if (!overlay || !container) return;
  overlay.classList.add('d-none');
  container.innerHTML = '';
}
/* Optional: ESC key support */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeEditorMedia();
  }
});