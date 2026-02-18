const DocViewer = {

  files: [],
  currentIndex: -1,

  open(filePath) {

    this.currentIndex = this.files.indexOf(filePath);

    const container = document.getElementById('documentViewerContainer');
    const controls = document.getElementById('docControls');

    if (!container) return;

    // =============================
    // PDF
    // =============================

    if (filePath.toLowerCase().endsWith('.pdf')) {

      container.innerHTML = `
        <iframe src="/${filePath}"
                style="width:100%; height:80vh; border:none;">
        </iframe>
      `;

    }

    // =============================
    // HTML
    // =============================

    else {

      fetch('/' + filePath)
        .then(r => r.text())
        .then(html => {
          container.innerHTML = html;
        })
        .catch(err => {
          container.innerHTML = `<p class="text-danger">Error loading document.</p>`;
          console.error(err);
        });

    }

    // =============================
    // Navigation Controls
    // =============================

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
