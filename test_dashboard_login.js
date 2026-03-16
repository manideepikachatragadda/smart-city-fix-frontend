import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Listen for console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('Browser Error:', msg.text());
        }
    });

    // Go to login page
    await page.goto('http://localhost:5173/login');
    
    // Fill in credentials
    await page.type('input[name="username"]', 'Anand');
    await page.type('input[name="password"]', '1234567890.');
    
    // Submit
    await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    console.log('Current URL after login:', page.url());
    
    // Take a screenshot
    await page.screenshot({ path: 'dashboard.png' });
    
    await browser.close();
})();
