const docViewer = {
  files: [],
  currentIndex: -1,
  open(filePath, files = null) {
    const container = document.getElementById('documentViewerContainer');
    const controls = document.getElementById('docControls');
    if (!container) return;
    if (Array.isArray(files)) {
      this.files = files;
    }
  this.currentIndex = this.files.indexOf(filePath);
    const ext = filePath.toLowerCase();
    if (ext.endsWith('.pdf')) {
      container.classList.add('pdf-mode');
      container.innerHTML = `
        <iframe 
          src="/${filePath}#navpanes=0&view=FitH"
          style="width:100%; height:1000px; border:none; display:block;">
        </iframe>
      `;
    }else {
  container.classList.remove('pdf-mode');
  container.innerHTML = `
    <iframe 
      id="docFrame"
      src="/${filePath}"
      style="width:100%; border:none;">
    </iframe>
  `;

  const frame = document.getElementById('docFrame');

  frame.onload = function () {
    const doc = frame.contentWindow.document;

    // Increase paragraph font size
    const style = doc.createElement('style');
    style.innerHTML = `
      p {
        font-size: 1.4rem;
      }
    `;
    doc.head.appendChild(style);

    // adjust height
    frame.style.height = doc.body.scrollHeight + 'px';
  };
}
    this.renderControls(controls);
  },
  renderControls(container) {
    if (!container) return;
    container.innerHTML = `
      <button class="btn btn-outline-secondary"
              onclick="docViewer.prev()"
              ${this.currentIndex <= 0 ? 'disabled' : ''}>
        ← Prev
      </button>
      <button class="btn btn-outline-secondary"
              onclick="docViewer.next()"
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
