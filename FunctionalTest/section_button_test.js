// const { Builder, By, until } = require('selenium-webdriver');
// require('chromedriver');

// (async function testAllButtons() {
//   let driver = await new Builder().forBrowser('chrome').build();
//   try {
//     await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 60000, script: 60000 });
//     await driver.get("https://www.xenonstack.com/");
//     await driver.manage().window().setRect({ width: 1850, height: 1053 });

//     // Helper function to open link in new tab, check navigation, and close the tab
//     const clickButtonInNewTab = async (buttonSelector) => {
//       const originalWindow = await driver.getWindowHandle();
//       await driver.wait(until.elementLocated(By.css(buttonSelector)), 10000);
//       const button = await driver.findElement(By.css(buttonSelector));
//       await driver.executeScript("arguments[0].scrollIntoView(true);", button); // Scroll to button
//       await driver.sleep(1000); // Add delay to ensure element is ready
//       await driver.executeScript("window.open(arguments[0].href);", button); // Open in new tab
//       const windows = await driver.getAllWindowHandles();
//       await driver.switchTo().window(windows[windows.length - 1]); // Switch to the new tab
//       await driver.sleep(2000); // Wait for navigation
//       await driver.close(); // Close the new tab
//       await driver.switchTo().window(originalWindow); // Switch back to original window
//       await driver.sleep(2000); // Wait for the page to load
//     };

//     const buttonSelectors = [
//       "#product-main-section-one .product-button > p",
//       "#product-main-section-two .product-button > p",
//       "#product-main-section-three .product-button > p",
//       "#product-main-section-four .product-button > p",
//       ".models-cta > p",
//       "#product-main-section-five .product-button",
//       "#product-main-section-six .product-button > p",
//       ".first-mid-banner-section-wrapper",
//       "a:nth-child(3) > .product-button",
//       ".second-mid-banner-button p"
//     ];

//     for (const selector of buttonSelectors) {
//       console.log(`Checking button: ${selector}`);
//       try {
//         await clickButtonInNewTab(selector);
//       } catch (e) {
//         console.error(`Error clicking button ${selector}:`, e);
//       }
//     }

//     await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
//   } finally {
//     await driver.quit();
//   }
// })();

const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function testAllButtons() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 120000, script: 120000 });
    await driver.get("https://www.xenonstack.com/");
    await driver.manage().window().setRect({ width: 1850, height: 1053 });

    // Helper function to click a button, check navigation, and navigate back
    const clickButtonAndNavigateBack = async (buttonSelector) => {
      await driver.wait(until.elementLocated(By.css(buttonSelector)), 20000);
      const button = await driver.findElement(By.css(buttonSelector));
      await driver.executeScript("arguments[0].scrollIntoView(true);", button); // Scroll to button
      await driver.sleep(1000); // Add delay to ensure element is ready

      const originalUrl = await driver.getCurrentUrl();

      // Click the button
      await button.click();
      await driver.sleep(10000); // Wait for the new page to load

      const newUrl = await driver.getCurrentUrl();
      const newPageTitle = await driver.getTitle();

      // Check if the page is showing blank
      if (newPageTitle === '' || newPageTitle === 'about:blank' || newUrl === originalUrl) {
        console.error(`Error: The page for button '${buttonSelector}' did not navigate correctly or is showing blank.`);
      } else {
        console.log(`Successfully navigated to ${newUrl} for button '${buttonSelector}'.`);
      }

      await driver.navigate().back(); // Navigate back to the original page
      await driver.sleep(5000); // Wait for the original page to load
    };

    const buttonSelectors = [
      "#product-main-section-one .product-button > p",
      "#product-main-section-two .product-button > p",
      "#product-main-section-three .product-button > p",
      "#product-main-section-four .product-button > p",
      ".models-cta > p",
      "#product-main-section-five .product-button",
      "#product-main-section-six .product-button > p",
      ".first-mid-banner-section-wrapper",
      "a:nth-child(3) > .product-button",
      ".second-mid-banner-button p"
    ];

    for (const selector of buttonSelectors) {
      console.log(`Checking button: ${selector}`);
      try {
        await clickButtonAndNavigateBack(selector);
      } catch (e) {
        console.error(`Error clicking button ${selector}:`, e);
      }
    }

    await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
  } finally {
    await driver.quit();
  }
})();
