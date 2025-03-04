const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function testInvalidPage() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 60000, script: 60000 });
    await driver.get("https://xenonstack.com/page--not-exist");
    await driver.manage().window().setRect({ width: 1850, height: 1053 });

    console.info("Checking 404 Error Handling");

    const pageLoader = async (driver) => {
      // Wait for the page to load
      await driver.wait(until.titleIs(''), 10000);
    };

    await pageLoader(driver);

    const title = (await driver.getTitle()).toLowerCase();
    const src = (await driver.getPageSource()).toLowerCase();

    if (title.includes('404') || src.includes('not found')) {
      console.info("404 page correctly displayed.");
    } else {
      console.error("404 page is missing or incorrect!");
    }

  } finally {
    await driver.quit();
  }
})();
