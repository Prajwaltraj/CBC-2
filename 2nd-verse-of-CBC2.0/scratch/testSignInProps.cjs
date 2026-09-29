const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  page.on('console', async msg => {
    const args = await Promise.all(msg.args().map(a => a.jsonValue()));
    console.log('BROWSER LOG:', ...args);
  });
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    if (window.Clerk && window.Clerk.client && window.Clerk.client.signIn) {
      console.log("signIn prototype:", Object.getOwnPropertyNames(Object.getPrototypeOf(window.Clerk.client.signIn)));
    }
  });
  
  await browser.close();
})();
