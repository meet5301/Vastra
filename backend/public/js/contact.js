document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    alert('Thanks for reaching out! We will respond soon.');
    form.reset();
  });
});
