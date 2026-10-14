const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\def46a7b-3762-4560-8575-e181e0c74dcb\\screenshots';

async function captureDashboards() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  try {
    // 1. Donor Dashboard
    console.log('Capturing Donor Dashboard...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', 'raj@demo.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));
    await page.goto('http://localhost:5173/dashboard/donor', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(screenshotDir, 'donor_dashboard.png'), fullPage: true });

    // Logout
    await page.evaluate(() => localStorage.clear());

    // 2. Receiver Claims Food and Views Dashboard
    console.log('Claiming food and capturing Receiver Dashboard...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', 'roti@demo.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    // Find and claim
    await page.goto('http://localhost:5173/find', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));
    const foodCards = await page.$$('.food-card');
    if (foodCards.length > 0) {
      await foodCards[0].click();
      await new Promise((r) => setTimeout(r, 1500));

      const claimBtn = await page.$('button.btn-primary.btn-lg');
      if (claimBtn) {
        await claimBtn.click();
        await new Promise((r) => setTimeout(r, 2500));
      }
      await page.screenshot({ path: path.join(screenshotDir, 'claimed_listing_details.png'), fullPage: true });
    }

    await page.goto('http://localhost:5173/dashboard/receiver', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotDir, 'receiver_dashboard_active.png'), fullPage: true });

    // Logout
    await page.evaluate(() => localStorage.clear());

    // 3. Admin Dashboard
    console.log('Capturing Admin Dashboard...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', 'admin@surplusfood.in');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));
    await page.goto('http://localhost:5173/dashboard/admin', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotDir, 'admin_dashboard.png'), fullPage: true });

    // 4. About Page
    console.log('Capturing About Page...');
    await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotDir, 'about_page.png'), fullPage: true });

    console.log('🎉 All dashboard screenshots captured successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

captureDashboards();
