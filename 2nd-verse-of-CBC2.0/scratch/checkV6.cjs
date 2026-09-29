const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new"
  });
  
  const page = await browser.newPage();
  await page.goto('https://clerk.com/docs/references/javascript/sign-up', { waitUntil: 'networkidle2' });
  
  const content = await page.evaluate(() => document.body.innerText);
  console.log(content.includes('verifyEmailCode') ? "FOUND verifyEmailCode" : "NOT FOUND verifyEmailCode");
  
  await browser.close();
})();
