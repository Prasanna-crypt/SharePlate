const puppeteer = require('puppeteer-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\def46a7b-3762-4560-8575-e181e0c74dcb\\screenshots';

async function claimAndCapture() {
  try {
    // 1. Login receiver via API
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'roti@demo.com', password: 'password123' }),
    }).then((r) => r.json());

    const token = loginRes.token;

    // 2. Fetch available listings
    const listRes = await fetch('http://localhost:5000/api/listings').then((r) => r.json());
    const available = listRes.filter((l) => l.status === 'available');

    if (available.length > 0) {
      const targetListing = available[0];
      console.log(`Claiming listing: ${targetListing.foodName}`);
      await fetch('http://localhost:5000/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId: targetListing._id, notes: 'Arriving in 30 mins with food van.' }),
      });
    }

    // 3. Open browser and take screenshot of Receiver Dashboard
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 900 },
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', 'roti@demo.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotDir, 'receiver_dashboard_with_claim.png'), fullPage: true });

    // Also take screenshot of users tab on admin dashboard
    const adminPage = await browser.newPage();
    await adminPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await adminPage.type('input[type="email"]', 'admin@surplusfood.in');
    await adminPage.type('input[type="password"]', 'admin123');
    await adminPage.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    // Click 'Users' tab
    const buttons = await adminPage.$$('button.btn-outline');
    for (const b of buttons) {
      const text = await adminPage.evaluate((el) => el.textContent, b);
      if (text.includes('users')) {
        await b.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 1000));
    await adminPage.screenshot({ path: path.join(screenshotDir, 'admin_users_tab.png'), fullPage: true });

    await browser.close();
    console.log('✅ Done capturing claimed receiver dashboard and admin users table!');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

claimAndCapture();
