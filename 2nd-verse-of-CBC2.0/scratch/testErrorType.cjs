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
        await window.Clerk.client.signUp.attemptEmailAddressVerification({ code: '000000' });
      }
    } catch (e) {
      console.log("CATCH ERROR:", e.name, e.message);
      if (e.errors) {
         console.log("CLERK ERRORS:", JSON.stringify(e.errors));
      }
    }
  });
  
  await browser.close();
})();
