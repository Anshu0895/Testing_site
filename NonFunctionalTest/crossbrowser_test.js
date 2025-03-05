const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver'); // Needed for Chrome
const { performance } = require('perf_hooks');

async function testInBrowser(browserName) {
  let driver;
  try {
    driver = await new Builder().forBrowser(browserName).build();
    console.log(`🚀 Running tests on ${browserName}...`);

    const urlsToTest = [
      'https://www.xenonstack.com/',
      // Add other URLs to test here
    ];

    for (let url of urlsToTest) {
      const start = performance.now();

      await driver.get(url);
      await driver.wait(until.elementLocated(By.css('body')), 10000);

      const duration = performance.now() - start;
      console.log(`✅ Response Time for ${url} on ${browserName}: ${duration.toFixed(2)}ms`);
    }
  } catch (error) {
    console.error(`❌ Error testing on ${browserName}:`, error);
  } finally {
    if (driver) await driver.quit();
  }
}

(async function crossBrowserTesting() {
  await testInBrowser('chrome');
  await testInBrowser('firefox');
})();

// const { Builder, By, until } = require('selenium-webdriver');
// const { Options: ChromeOptions } = require('selenium-webdriver/chrome');
// const { Options: FirefoxOptions } = require('selenium-webdriver/firefox');
// const { performance } = require('perf_hooks');
// const fs = require('fs');
// require('chromedriver'); // Needed for Chrome
// require('geckodriver'); // Needed for Firefox

// async function testInBrowser(browserName) {
//   let driver;
//   try {
//     let options;
//     if (browserName === 'chrome') {
//       options = new ChromeOptions();
//     } else if (browserName === 'firefox') {
//       options = new FirefoxOptions();
//       options.setBinary('/usr/bin/firefox'); // Replace with your Firefox binary path if needed
//     }

//     driver = await new Builder().forBrowser(browserName).setChromeOptions(options).setFirefoxOptions(options).build();
//     console.log(`🚀 Running tests on ${browserName}...`);

//     const urlsToTest = [
//       'https://www.xenonstack.com/',
//       // Add other URLs to test here
//     ];

//     for (let url of urlsToTest) {
//       const start = performance.now();

//       await driver.get(url);
//       await driver.wait(until.elementLocated(By.css('body')), 10000);

//       const duration = performance.now() - start;
//       console.log(`✅ Response Time for ${url} on ${browserName}: ${duration.toFixed(2)}ms`);
//     }
//   } catch (error) {
//     console.error(`❌ Error testing on ${browserName}:`, error);
//   } finally {
//     if (driver) await driver.quit();
//   }
// }

// (async function crossBrowserTesting() {
//   await testInBrowser('chrome');
//   await testInBrowser('firefox');
// })();
