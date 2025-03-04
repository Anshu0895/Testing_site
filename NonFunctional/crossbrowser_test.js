const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
require('geckodriver');
const { performance } = require('perf_hooks');

async function testInBrowser(browserName) {
  let driver;
  if (browserName === 'chrome') {
    driver = await new Builder().forBrowser('chrome').build();
  } else if (browserName === 'firefox') {
    driver = await new Builder().forBrowser('firefox').build();
  }

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
      console.log(`Response Time for ${url} on ${browserName}: ${duration.toFixed(2)}ms`);
    }
  } catch (error) {
    console.error(`Error testing on ${browserName}:`, error);
  } finally {
    await driver.quit();
  }
}

(async function crossBrowserTesting() {
  await testInBrowser('chrome');
  await testInBrowser('firefox');
})();
