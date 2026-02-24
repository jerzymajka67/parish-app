 function feedback() {
  const feedback = document.getElementById('server-feedback');
  if (!feedback) return;
  setTimeout(() => {
    feedback.remove();
  }, 6000);}