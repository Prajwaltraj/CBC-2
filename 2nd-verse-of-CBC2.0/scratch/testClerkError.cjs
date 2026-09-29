const puppeteer = require('puppeteer-core');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  console.log("Navigating to http://localhost:5173...");
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  console.log("Typing email...");
  await page.waitForSelector('input[type="email"]');
  // Type the exact email they used to reproduce the error exactly
  await page.type('input[type="email"]', 'nirwithbc@gmail.com');
  
  console.log("Clicking Send OTP...");
  await page.click('button[type="submit"]');
  
  console.log("Waiting 5 seconds to see result...");
  await new Promise(r => setTimeout(r, 5000));
  
  const status = await page.evaluate(() => {
    const statusEl = document.querySelector('form + div') || document.body;
    return statusEl.innerText;
  });
  console.log("Current UI Status Text:", status);
  
  await browser.close();
})();
