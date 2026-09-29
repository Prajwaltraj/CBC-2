const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('https://cbc-2-xv2u.vercel.app', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Fill email
  await page.type('input[type="email"]', 'testbot123@gmail.com');
  await page.click('button[type="submit"]');
  
  // Wait for OTP step
  await new Promise(r => setTimeout(r, 6000));
  
  // Enter fake code
  const codeInput = await page.$('input[placeholder="123456"]');
  if (codeInput) {
    await codeInput.type('000000');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 5000));
  } else {
    console.log("Could not find OTP input");
  }
  
  await browser.close();
})();
