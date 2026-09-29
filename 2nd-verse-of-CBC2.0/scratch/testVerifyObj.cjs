const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  page.on('console', async msg => {
    const args = await Promise.all(msg.args().map(a => a.jsonValue()));
    console.log('BROWSER LOG:', ...args);
  });
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Try to initiate a sign up and extract what verifyEmailCode returns
  await page.evaluate(async () => {
    try {
      if (window.Clerk && window.Clerk.client && window.Clerk.client.signUp) {
        const su = window.Clerk.client.signUp;
        await su.create({ emailAddress: 'test_fake@gmail.com' });
        await su.sendEmailCode();
        
        // Wait a bit
        await new Promise(r => setTimeout(r, 1000));
        
        // Enter a fake code, just to see the error format or response format
        const result = await su.verifyEmailCode({ code: '000000' }).catch(e => e);
        console.log("verifyEmailCode Result:", result);
      }
    } catch(err) {
      console.log("TEST ERROR:", err);
    }
  });
  
  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
})();
