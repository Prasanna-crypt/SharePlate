const puppeteer = require('puppeteer-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\def46a7b-3762-4560-8575-e181e0c74dcb\\screenshots';

async function captureDonateMap() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 950 },
  });

  const page = await browser.newPage();
  try {
    // Login as donor
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', 'raj@demo.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    // Navigate to /donate
    await page.goto('http://localhost:5173/donate', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 2500));

    // Scroll down to the map section
    await page.evaluate(() => {
      window.scrollTo(0, 480);
    });
    await new Promise((r) => setTimeout(r, 1000));

    const shotPath = path.join(screenshotDir, 'donate_food_interactive_map.png');
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot to: ${shotPath}`);
  } catch (err) {
    console.error('Screenshot error:', err);
  } finally {
    await browser.close();
  }
}

captureDonateMap();
