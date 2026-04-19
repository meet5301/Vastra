const markup = `
<div class="container">
  <div class="contact-wrapper">
    <div class="form-section">
      <label>First Name</label>
      <input type="text" />
      <label>Last Name</label>
      <input type="text" />
      <label>Email *</label>
      <input type="email" />
      <label>Message</label>
      <textarea rows="5"></textarea>
      <button class="submit-btn">SUBMIT</button>
    </div>

    <div class="info-section">
      <img src="/images/abc.png" />
      <h2>CONTACT</h2>
      <p><i class="fa-solid fa-phone"></i> +91 98765 43210</p>
      <p><i class="fa-solid fa-fax"></i> 080 1234 5678</p>
      <p><i class="fa-solid fa-envelope"></i> info@aether.com</p>
      <p><i class="fa-solid fa-globe"></i> www.aether.com</p>
    </div>
  </div>
</div>
`;

export default function Review() {
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
