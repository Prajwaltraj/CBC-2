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
  
  await page.evaluate(async () => {
    try {
      if (window.Clerk && window.Clerk.client && window.Clerk.client.signUp) {
        // We can't easily bypass CAPTCHA in Puppeteer to trigger a real verification failure.
        // I'll just check if error object is a standard ClerkError.
      }
    } catch (e) {}
  });
  
  await browser.close();
})();
