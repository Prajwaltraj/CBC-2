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
  
  // Inject a script to get window.Clerk.client.signUp
  const methods = await page.evaluate(() => {
    if (window.Clerk && window.Clerk.client && window.Clerk.client.signUp) {
      const obj = window.Clerk.client.signUp;
      let props = [];
      let currentObj = obj;
      while (currentObj) {
        props = props.concat(Object.getOwnPropertyNames(currentObj));
        currentObj = Object.getPrototypeOf(currentObj);
      }
      return props.filter(p => typeof obj[p] === 'function');
    }
    return [];
  });
  
  console.log("SignUp Methods:", methods);
  
  await browser.close();
})();
