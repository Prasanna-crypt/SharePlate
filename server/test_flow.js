const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\def46a7b-3762-4560-8575-e181e0c74dcb\\screenshots';

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function runTestFlow() {
  console.log('🚀 Starting end-to-end browser verification...');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  try {
    // 1. Home Page
    console.log('1. Visiting Home Page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));
    const homePath = path.join(screenshotDir, '1_home_page.png');
    await page.screenshot({ path: homePath, fullPage: true });
    console.log(`Saved screenshot: ${homePath}`);

    // 2. Find Food Page
    console.log('2. Visiting Find Food Page...');
    await page.goto('http://localhost:5173/find', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));
    const findPath = path.join(screenshotDir, '2_find_food.png');
    await page.screenshot({ path: findPath, fullPage: true });
    console.log(`Saved screenshot: ${findPath}`);

    // 3. Register a new Donor
    console.log('3. Registering new donor...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
    const testEmail = `kandivali_donor_${Date.now()}@example.com`;
    const textInputs = await page.$$('input[type="text"]');
    if (textInputs.length > 0) await textInputs[0].type('Kandivali Community Kitchen');
    await page.type('input[type="email"]', testEmail);
    await page.type('input[type="password"]', 'donorPass123');
    await page.type('input[type="tel"]', '9820011223');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    // 4. Donate Food
    console.log('4. Creating food listing...');
    await page.goto('http://localhost:5173/donate', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    const foodNameInput = await page.$('input[placeholder*="Rajma"]');
    if (foodNameInput) await foodNameInput.type('Fresh Methi Thepla & Curd (50 packs)');

    const descInput = await page.$('textarea');
    if (descInput) await descInput.type('Hygienically packed theplas prepared for today afternoon community event.');

    const qtyInput = await page.$('input[placeholder*="25 servings"]');
    if (qtyInput) await qtyInput.type('50 packets');

    const addrInput = await page.$('input[placeholder*="Thakur Complex"]');
    if (addrInput) await addrInput.type('Thakur Village, Kandivali East, Mumbai');

    // Fill dates using evaluate to avoid typing issues
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="datetime-local"]');
      const now = new Date();
      const prep = new Date(now.getTime() - 3600000).toISOString().slice(0, 16);
      const exp = new Date(now.getTime() + 14400000).toISOString().slice(0, 16);
      if (inputs[0]) {
        inputs[0].value = prep;
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (inputs[1]) {
        inputs[1].value = exp;
        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Check all safety checkboxes
    await page.evaluate(() => {
      const boxes = document.querySelectorAll('input[type="checkbox"]');
      boxes.forEach((b) => {
        b.click();
      });
    });

    await new Promise((r) => setTimeout(r, 500));
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise((r) => setTimeout(r, 2500));

    const donorDashPath = path.join(screenshotDir, '3_donor_dashboard.png');
    await page.screenshot({ path: donorDashPath, fullPage: true });
    console.log(`Saved screenshot: ${donorDashPath}`);

    // 5. Login as Receiver & Claim
    console.log('5. Logging in as Receiver (roti@demo.com)...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', 'roti@demo.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    // Browse to Find Food, pick first available listing
    await page.goto('http://localhost:5173/find', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));

    const listingLinks = await page.$$('a[href*="/listing/"]');
    if (listingLinks.length > 0) {
      await listingLinks[0].click();
      await new Promise((r) => setTimeout(r, 1500));

      const detailsPath = path.join(screenshotDir, '4_listing_details.png');
      await page.screenshot({ path: detailsPath, fullPage: true });
      console.log(`Saved screenshot: ${detailsPath}`);

      // Claim button
      const claimBtn = await page.$('button.btn-primary.btn-lg');
      if (claimBtn) {
        await claimBtn.click();
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // 6. Receiver Dashboard with Claim
    console.log('6. Viewing Receiver Dashboard...');
    await page.goto('http://localhost:5173/dashboard/receiver', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));
    const receiverDashPath = path.join(screenshotDir, '5_receiver_dashboard.png');
    await page.screenshot({ path: receiverDashPath, fullPage: true });
    console.log(`Saved screenshot: ${receiverDashPath}`);

    // 7. Login as Admin
    console.log('7. Logging in as Admin...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', 'admin@surplusfood.in');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));
    await page.goto('http://localhost:5173/dashboard/admin', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));
    const adminPath = path.join(screenshotDir, '6_admin_dashboard.png');
    await page.screenshot({ path: adminPath, fullPage: true });
    console.log(`Saved screenshot: ${adminPath}`);

    console.log('✨ All browser flows completed and screenshots captured successfully!');
  } catch (err) {
    console.error('Browser testing error:', err);
  } finally {
    await browser.close();
  }
}

runTestFlow();
