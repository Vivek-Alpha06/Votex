const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173/');
  
  // Wait to see if UI renders
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Checking if wallet gate exists...");
  const gateText = await page.evaluate(() => document.body.innerText);
  console.log("Body text:", gateText.substring(0, 100)); // Just a snippet

  await browser.close();
})();
