const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  // Listen and extract the full object
  page.on('console', msg => {
    Promise.all(msg.args().map(arg => arg.jsonValue())).then(args => {
      console.log('BROWSER LOG:', ...args);
    });
  });
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'nirwithbc@gmail.com');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 10000));
  await browser.close();
})();
