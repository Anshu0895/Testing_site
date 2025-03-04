const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const { performance } = require('perf_hooks');

(async function responseTimeTesting() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://www.xenonstack.com/');
    await driver.manage().window().setRect({ width: 1850, height: 1053 });

    // Helper function to ensure element is clickable
    const ensureClickable = async (element) => {
      await driver.executeScript("arguments[0].scrollIntoView(true);", element);
      await driver.wait(until.elementIsVisible(element), 10000);
      await driver.wait(until.elementIsEnabled(element), 10000);
    };

    // Elements to Test
    const elementsToTest = [
      "#product-main-section-one .product-button > p",
      "#product-main-section-two .product-button > p",
      // Add other selectors to test here
    ];

    for (let selector of elementsToTest) {
      const start = performance.now();

      try {
        // Find and click the element
        const element = await driver.findElement(By.css(selector));
        await ensureClickable(element);
        await driver.executeScript("arguments[0].click();", element); // Click using JavaScript to ensure success

        // Wait for navigation or response
        await driver.wait(until.elementLocated(By.css('body')), 10000);

        const duration = performance.now() - start;
        console.log(`Response Time for click on ${selector}: ${duration.toFixed(2)}ms`);

        // Navigate back to the original page
        await driver.navigate().back();
        await driver.wait(until.elementLocated(By.css('body')), 10000);
      } catch (e) {
        console.error(`Error clicking element ${selector}:`, e);
      }
    }
  } finally {
    await driver.quit();
  }
})();
