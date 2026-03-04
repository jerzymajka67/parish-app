const docViewer = {
  files: [],
  currentIndex: -1,
  open(filePath) {
    console.log(filePath, ' to jest path from docViewer');
    this.currentIndex = this.files.indexOf(filePath);
    const container = document.getElementById('documentViewerContainer');
    const controls = document.getElementById('docControls');
    if (!container) return;
    if (filePath.toLowerCase().endsWith('.pdf')) {
      container.classList.add('pdf-mode');
     container.innerHTML = `
      <iframe 
        src="/${filePath}#navpanes=0&view=FitH"
        style="width:100%; height:190vh; border:none;">
      </iframe>
    `;
    } else {
      container.classList.remove('pdf-mode');
      fetch('/' + filePath)
        .then(r => r.text())
        .then(html => {
        container.innerHTML = `
        <div style="max-width: 900px; margin: 40px auto; padding: 0 20px;">
          ${html}
        </div>
      `;
        }) .catch(err => {
              container.innerHTML = `<p class="text-danger">Error loading document.</p>`;
              console.error(err);
          });
    }
    this.renderControls(controls);
  },
  renderControls(container) {
    if (!container) return;
    container.innerHTML = `
      <button class="btn btn-outline-secondary"
              onclick="DocViewer.prev()"
              ${this.currentIndex <= 0 ? 'disabled' : ''}>
        ← Prev
      </button> 

      <button class="btn btn-outline-secondary"
              onclick="DocViewer.next()"
              ${this.currentIndex >= this.files.length - 1 ? 'disabled' : ''}>
        Next →
      </button>
    `;
  },
  next() {
    if (this.currentIndex < this.files.length - 1) {
      this.open(this.files[this.currentIndex + 1]);
    }
  },
  prev() {
    if (this.currentIndex > 0) {
      this.open(this.files[this.currentIndex - 1]);
    }
  }
};
