document.addEventListener('DOMContentLoaded', function () {
  const aboutHeader = document.querySelector('.about-copy h1');
  if (aboutHeader) {
    aboutHeader.style.opacity = '0';
    setTimeout(() => {
      aboutHeader.style.transition = 'opacity 0.7s ease';
      aboutHeader.style.opacity = '1';
    }, 80);
  }
});
