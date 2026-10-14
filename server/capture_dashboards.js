const puppeteer = require('puppeteer-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\def46a7b-3762-4560-8575-e181e0c74dcb\\screenshots';

async function loginAndCapture(email, pass, filename, waitMs = 2500) {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900 },
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', pass);
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, waitMs));
  await page.screenshot({ path: path.join(screenshotDir, filename), fullPage: true });
  await browser.close();
}

async function run() {
  console.log('Capturing Receiver...');
  await loginAndCapture('roti@demo.com', 'password123', 'receiver_dashboard.png');

  console.log('Capturing Admin...');
  await loginAndCapture('admin@surplusfood.in', 'admin123', 'admin_dashboard.png');

  console.log('Capturing Donor...');
  await loginAndCapture('raj@demo.com', 'password123', 'donor_dashboard.png');
}

run();
