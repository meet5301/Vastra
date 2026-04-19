const markup = `
<div class="container">
  <h1>STYLE<br />JOURNAL</h1>
  <div class="top-bar">
    <span>ALL ARTICLES ▼</span>
    <div class="arrows">
      <i class="fa-solid fa-chevron-left"></i>
      <i class="fa-solid fa-chevron-right"></i>
    </div>
  </div>
  <div class="grid">
    <div class="card"><img src="/images/5.png" /><h3>STYLE TRENDS OF THE YEAR</h3><p>Lorem ipsum dolor sit amet consectetur.</p><span>5 minutes ago</span></div>
    <div class="card"><img src="/images/6.png" /><h3>CASUAL FASHION GUIDE</h3><p>Modern outfit ideas for daily wear.</p><span>8 minutes ago</span></div>
    <div class="card"><img src="/images/7.png" /><h3>COLOUR COMBINATION IDEAS</h3><p>Best matching styles for 2026.</p><span>10 minutes ago</span></div>
    <div class="card"><img src="/images/3.png" /><h3>STREET FASHION LOOK</h3><p>Urban style inspiration.</p><span>12 minutes ago</span></div>
    <div class="card"><img src="/images/4.png" /><h3>FORMAL WEAR GUIDE</h3><p>Professional outfits made easy.</p><span>15 minutes ago</span></div>
    <div class="card"><img src="/images/8.png" /><h3>WINTER STYLE COLLECTION</h3><p>Stay warm and stylish.</p><span>20 minutes ago</span></div>
  </div>
</div>
`;

export default function Journal() {
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
