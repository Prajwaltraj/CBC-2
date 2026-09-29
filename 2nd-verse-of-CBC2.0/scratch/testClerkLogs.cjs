const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Wait for React to mount and Clerk to initialize
  await new Promise(r => setTimeout(r, 2000));
  
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'nirwithbc@gmail.com');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 3000));
  
  const status = await page.evaluate(() => {
    const statusEl = document.querySelector('form + div') || document.body;
    return statusEl.innerText;
  });
  console.log("Current UI Status Text:", status);
  
  await browser.close();
})();
