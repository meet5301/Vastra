const markup = `
<div class="container">
  <div class="story-section">
    <div class="text">
      <div class="line"></div>
      <h1>OUR STORY</h1>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto, temporibus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, culpa.</p>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus magni, laborum earum molestiae explicabo vero aspernatur recusandae commodi eligendi.</p>
    </div>
    <div class="image"><img src="/images/abc.png" /></div>
  </div>

  <div class="about-section">
    <div class="line"></div>
    <h2>ABOUT US</h2>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium, quos. Sit fugiat consectetur, adipisci culpa deserunt officiis exercitationem.</p>
    <p>We are a modern fashion brand focused on minimal design, high quality, and premium experience for our customers.</p>
  </div>
</div>
`;

export default function Story() {
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
