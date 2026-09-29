const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Try to find the exact clerk object
  await page.evaluate(() => {
    if (window.Clerk && window.Clerk.client && window.Clerk.client.signUp) {
      console.log("Found signUp:", Object.keys(window.Clerk.client.signUp));
      console.log("SignUp prototype:", Object.getOwnPropertyNames(Object.getPrototypeOf(window.Clerk.client.signUp)));
    } else {
      console.log("Could not find window.Clerk.client.signUp");
    }
  });
  
  await browser.close();
})();
