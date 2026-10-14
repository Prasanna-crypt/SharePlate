const puppeteer = require('puppeteer-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\def46a7b-3762-4560-8575-e181e0c74dcb\\screenshots';

async function captureFindMap() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 950 },
  });

  const page = await browser.newPage();
  try {
    // Navigate to Find Food
    await page.goto('http://localhost:5173/find', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 2000));

    // Click 'Map View' button
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text.includes('Map View')) {
        await b.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 3000));

    // Scroll down to show the map nicely
    await page.evaluate(() => {
      window.scrollTo(0, 180);
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Click on one of the marker pins on the Leaflet map to show its popup card
    const marker = await page.$('.custom-food-marker');
    if (marker) {
      await marker.click();
      await new Promise((r) => setTimeout(r, 1500));
    }

    const shotPath = path.join(screenshotDir, 'find_food_live_map_pins.png');
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot to: ${shotPath}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

captureFindMap();
