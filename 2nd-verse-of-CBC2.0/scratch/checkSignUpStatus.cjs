const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new"
  });
  
  const page = await browser.newPage();
  
  page.on('console', async msg => {
    const text = msg.text();
    if (text.includes('missing_requirements') || text.includes('CLERK')) {
        console.log('BROWSER LOG:', text);
    }
  });
  
  await page.goto('https://cbc-2-xv2u.vercel.app', { waitUntil: 'networkidle2' });
  
  await page.evaluate(async () => {
    const clerk = window.Clerk.client;
    console.log("CLERK ENVIRONMENT: " + JSON.stringify(window.Clerk.__unstable__environment));
  });
  
  await browser.close();
})();
