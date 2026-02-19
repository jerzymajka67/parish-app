function deleteModalHTML() {
  if (document.getElementById('confirmDeleteModal')) return;

  const modalHtml = `
    <div class="modal fade" id="confirmDeleteModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm delete</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            Delete <strong id="modal-folder-name"></strong>?
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}
function initDeleteModal() {
  deleteModalHTML();
  const deleteForm = document.getElementById('deleteForm');
  const deleteBtn = document.getElementById('deleteBtn');
  const deleteInput = document.getElementById('deleteFileName');
  const modalEl = document.getElementById('confirmDeleteModal');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const modalName = document.getElementById('modal-folder-name');
  if (!deleteForm || !deleteBtn || !modalEl) return;
  const modal = new bootstrap.Modal(modalEl);
  let fileToDelete = null;
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!window.selectedFile) {
      alert('No file selected');
      return;
    }

    fileToDelete = window.selectedFile;
    modalName.textContent = fileToDelete;
    deleteInput.value = fileToDelete;
    modal.show();
  });
  confirmBtn.addEventListener('click', () => {
    if (!fileToDelete) return;
    deleteForm.submit();   
  });
}

