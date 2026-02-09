function initDeleteModal() {
  const deleteForm = document.getElementById('deleteForm');
  const deleteBtn = document.getElementById('deleteBtn');
  const deleteInput = document.getElementById('deleteFileName');
  const modalEl = document.getElementById('confirmDeleteModal');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const modalName = document.getElementById('modal-folder-name');

  // 🔑 If this page doesn't have delete feature → do nothing
  if (!deleteForm || !deleteBtn || !modalEl) return;

  const modal = new bootstrap.Modal(modalEl);
  let fileToDelete = null;

  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if (!deleteInput.value) {
      alert('No file selected');
      return;
    }

    fileToDelete = deleteInput.value;
    modalName.textContent = fileToDelete;
    modal.show();
  });

  confirmBtn.addEventListener('click', () => {
    if (!fileToDelete) return;
    deleteForm.submit();
  });
}
