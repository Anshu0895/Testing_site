// const { Builder } = require('selenium-webdriver');
// require('chromedriver');

// (async function testResponsiveDesign() {
//   let driver = await new Builder().forBrowser('chrome').build();
//   try {
//     const sizes = [
//       { width: 1920, height: 1080 }, // Desktop
//       { width: 1366, height: 768 },  // Laptop
//       { width: 768, height: 1024 },  // Tablet (Portrait)
//       { width: 1024, height: 768 },  // Tablet (Landscape)
//       { width: 375, height: 667 }    // Mobile
//     ];

//     for (const size of sizes) {
//       await driver.manage().window().setRect(size);
//       await driver.get('https://www.xenonstack.com/');

//       console.log(`Testing at ${size.width}x${size.height}`);
//       // Add your assertions here

//       await driver.sleep(3000); // Wait to observe the layout
//     }
//   } finally {
//     await driver.quit();
//   }
// })();
const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function testResponsiveDesign() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    const sizes = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1366, height: 768 },  // Laptop
      { width: 768, height: 1024 },  // Tablet (Portrait)
      { width: 1024, height: 768 },  // Tablet (Landscape)
      { width: 375, height: 667 }    // Mobile
    ];

    for (const size of sizes) {
      await driver.manage().window().setRect(size);
      await driver.get('https://www.xenonstack.com/');

      console.log(`Testing at ${size.width}x${size.height}`);

      // Check if the hamburger menu is present and visible
      try {
        const hamburgerMenu = await driver.wait(until.elementLocated(By.xpath("//img[@id='uncolorHamburgerMobile']")), 5000);
        const isDisplayed = await hamburgerMenu.isDisplayed();

        if (isDisplayed) {
          console.log(`Passed at ${size.width}x${size.height}: Hamburger menu is visible`);
        } else {
          console.log(`Passed at ${size.width}x${size.height}: Hamburger menu is present but not visible`);
        }
      } catch (error) {
        console.error(`Bug detected at ${size.width}x${size.height}: Hamburger menu is not present`);
      }

      await driver.sleep(3000); // Wait to observe the layout
    }
  } finally {
    await driver.quit();
  }
})();
