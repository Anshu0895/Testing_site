const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const fs = require('fs');

(async function testResponsiveDesign() {
  let driver = await new Builder().forBrowser('chrome').build();
  let reportData = [];

  try {
    const sizes = [
      { width: 1920, height: 1080, device: "Desktop" },
      { width: 1366, height: 768, device: "Laptop" },
      { width: 768, height: 1024, device: "Tablet (Portrait)" },
      { width: 1024, height: 768, device: "Tablet (Landscape)" },
      { width: 375, height: 667, device: "Mobile" }
    ];

    for (const size of sizes) {
      await driver.manage().window().setRect({ width: size.width, height: size.height });
      await driver.get('https://www.xenonstack.com/');

      console.log(`Testing at ${size.width}x${size.height} (${size.device})`);

      let result = {
        device: size.device,
        width: size.width,
        height: size.height,
        status: "Passed",
        message: "Hamburger menu is visible"
      };

      // Check if the hamburger menu is present and visible
      try {
        const hamburgerMenu = await driver.wait(until.elementLocated(By.xpath("//img[@id='uncolorHamburgerMobile']")), 5000);
        const isDisplayed = await hamburgerMenu.isDisplayed();

        if (!isDisplayed) {
          result.message = "Hamburger menu is present but not visible";
        }
      } catch (error) {
        result.status = "Bug Detected";
        result.message = "Hamburger menu is missing";
      }

      reportData.push(result);
      console.log(`${result.status} at ${size.width}x${size.height}: ${result.message}`);

      await driver.sleep(3000); // Wait to observe the layout
    }
  } finally {
    await driver.quit();
    generateReports(reportData);
  }
})();

// Function to generate JSON & HTML reports
function generateReports(data) {
  // Save JSON report
  fs.writeFileSync("responsive_test.json", JSON.stringify(data, null, 2));

  // Create HTML report
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Design Test Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid black; padding: 10px; text-align: left; }
      th { background-color: #f2f2f2; }
      .bug { background-color: #ffcccc; }
      .passed { background-color: #ccffcc; }
    </style>
  </head>
  <body>
    <h2>Responsive Design Test Report</h2>
    <table>
      <tr><th>Device</th><th>Width</th><th>Height</th><th>Status</th><th>Message</th></tr>
      ${data.map(row => `
        <tr class="${row.status === 'Bug Detected' ? 'bug' : 'passed'}">
          <td>${row.device}</td>
          <td>${row.width}</td>
          <td>${row.height}</td>
          <td>${row.status}</td>
          <td>${row.message}</td>
        </tr>`).join("")}
    </table>
  </body>
  </html>
  `;

  fs.writeFileSync("responsive_test.html", htmlContent);
  console.log("✅ Reports generated: responsive_test.json & responsive_test.html");
}