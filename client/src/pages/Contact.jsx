import { useEffect } from "react";

const markup = `
<div class="contact-page">
  <div class="contact-grid">
    <div class="contact-form-card">
      <h1>Contact Us</h1>
      <form id="contact-form">
        <label for="first-name">First Name</label>
        <input id="first-name" type="text" placeholder="First name" />

        <label for="last-name">Last Name</label>
        <input id="last-name" type="text" placeholder="Last name" />

        <label for="email">Email</label>
        <input id="email" type="email" placeholder="you@example.com" />

        <label for="message">Message</label>
        <textarea id="message" rows="5" placeholder="Write your message..."></textarea>

        <button type="submit">Send Message</button>
      </form>
    </div>

    <div class="contact-info-card">
      <h2>Stay in Touch</h2>
      <p>
        Share your questions and feedback. Our team is happy to help you
        with orders, styling, and product details.
      </p>

      <div class="contact-item"><i class="fa-solid fa-phone"></i><span>+91 98765 43210</span></div>
      <div class="contact-item"><i class="fa-solid fa-envelope"></i><span>support@vastra.com</span></div>
      <div class="contact-item"><i class="fa-solid fa-location-dot"></i><span>New Delhi, India</span></div>
    </div>
  </div>
</div>
`;

export default function Contact() {
  useEffect(() => {
    const form = document.getElementById("contact-form");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Thanks for reaching out! We will respond soon.");
      form.reset();
    });
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
