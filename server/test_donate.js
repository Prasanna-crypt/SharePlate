const puppeteer = require('puppeteer-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 950 },
  });

  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  // 1. Log in as donor
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.type('input[type="email"]', 'raj@demo.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2000));

  // 2. Go to /donate
  await page.goto('http://localhost:5173/donate', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1000));

  // Set values via React native setter helper
  await page.evaluate(() => {
    function setReactInput(el, val) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const titleEl = document.querySelector('input[placeholder*="Rajma"]');
    if (titleEl) setReactInput(titleEl, 'Fresh Homemade Rajma Rice Catering');

    const qtyEl = document.querySelector('input[placeholder*="servings"]');
    if (qtyEl) setReactInput(qtyEl, '20 servings');
  });

  // Check form values
  const formValues = await page.evaluate(() => {
    const title = document.querySelector('input[placeholder*="Rajma"]')?.value;
    const qty = document.querySelector('input[placeholder*="servings"]')?.value;
    const addr = document.querySelector('input[placeholder*="Building No. 4"]')?.value;
    return { title, qty, addr };
  });
  console.log('Form values in React state:', formValues);

  // Trigger form submit directly
  console.log('Triggering form.requestSubmit() directly in browser context...');
  const res = await page.evaluate(() => {
    const form = document.querySelector('form');
    try {
      form.requestSubmit();
      return 'OK requested submit';
    } catch (e) {
      return 'Error: ' + e.message;
    }
  });
  console.log('requestSubmit return value:', res);

  await new Promise((r) => setTimeout(r, 3000));

  console.log('Final URL after requestSubmit:', page.url());
  const errorText = await page.evaluate(
    () => document.querySelector('.alert-error')?.textContent || 'None'
  );
  console.log('Any error alert:', errorText);

  await page.screenshot({ path: 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\def46a7b-3762-4560-8575-e181e0c74dcb\\screenshots\\donor_publish_success_redirect.png' });
  console.log('Saved screenshot to donor_publish_success_redirect.png');

  await browser.close();
}

run().catch(console.error);
