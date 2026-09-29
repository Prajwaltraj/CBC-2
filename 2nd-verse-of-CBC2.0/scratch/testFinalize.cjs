const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new"
  });
  
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('https://cbc-2-xv2u.vercel.app', { waitUntil: 'networkidle2' });
  
  await page.evaluate(async () => {
    try {
      const clerk = window.Clerk;
      console.log("Does signUp.finalize exist?", typeof clerk.client.signUp.finalize === 'function');
    } catch (e) {
      console.log(e.message);
    }
  });
  
  await browser.close();
})();
