const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const { performance } = require('perf_hooks');

(async function responseTimeTesting() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    const urlsToTest = [
      'https://www.xenonstack.com/',
      // Add other URLs to test here
    ];

    for (let url of urlsToTest) {
      const start = performance.now();

      // Navigate to the URL
      await driver.get(url);

      // Wait for the page to load completely
      await driver.wait(until.elementLocated(By.css('body')), 10000);

      const duration = performance.now() - start;
      console.log(`Response Time for ${url}: ${duration.toFixed(2)}ms`);
    }
  } finally {
    await driver.quit();
  }
})();
