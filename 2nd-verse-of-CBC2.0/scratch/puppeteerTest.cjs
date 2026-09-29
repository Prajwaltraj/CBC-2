const puppeteer = require('puppeteer-core');
const chromeLauncher = require('chrome-launcher');

(async () => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const response = await fetch(`http://127.0.0.1:${chrome.port}/json/version`);
  const data = await response.json();

  const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'cc1340975@gmail.com');
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 6000));
  
  await browser.close();
  chrome.kill();
})();
