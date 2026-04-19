document.addEventListener('DOMContentLoaded', function() {
  const footerContainer = document.createElement('div');
  footerContainer.id = 'footer-container';
  document.body.appendChild(footerContainer);

  fetch('/templates/footer.html')
    .then(r => r.text())
    .then(data => {
      const parser = new DOMParser();
      const doc    = parser.parseFromString(data, 'text/html');
      // Inject style tags from footer
      doc.querySelectorAll('style').forEach(s => document.head.appendChild(s.cloneNode(true)));
      const footer = doc.querySelector('footer');
      if (footer) footerContainer.appendChild(footer);
    })
    .catch(err => console.error('Footer load error:', err));
});
