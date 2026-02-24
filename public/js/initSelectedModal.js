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

function initSelectedModal() {
  deleteModalHTML();
  const form = document.getElementById('deleteSelectedForm');
  const deleteBtn = document.getElementById('deleteBtn');
  const modalEl = document.getElementById('confirmDeleteModal');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const modalName = document.getElementById('modal-folder-name');

  if (!form || !deleteBtn || !modalEl) return;

  const modal = new bootstrap.Modal(modalEl);
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const files = [...document.querySelectorAll('input[name="files[]"]:checked')]
      .map(cb => cb.value);
    let folder = null;

    if (!files.length && window.selectedItem && window.selectedItem.tagName === 'A') {
      folder = document.querySelector('#deleteSelectedForm input[name="currentPath"]').value;
    }
    if (!files.length && !folder) {
      alert('No file selected');
      return;
    }
    modalName.textContent =
      files.length
        ? `${files.length} file(s)`
        : folder.split('/').pop();
    modal.show();
  });

  confirmBtn.addEventListener('click', () => {
    form.requestSubmit();   // Only this
  });
}