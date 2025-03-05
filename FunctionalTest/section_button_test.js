const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
require('chromedriver');

(async function testAllButtons() {
  let driver = await new Builder().forBrowser('chrome').build();
  let startTime = new Date();
  let reportData = [];
  let successCount = 0;
  let failureCount = 0;

  try {
    await driver.manage().setTimeouts({ implicit: 15000, pageLoad: 120000, script: 120000 });
    await driver.get("https://www.xenonstack.com/");
    await driver.manage().window().setRect({ width: 1850, height: 1053 });

    const clickButtonAndNavigateBack = async (buttonSelector) => {
      let result = { selector: buttonSelector, status: "Failed", url: "" };
      try {
        await driver.wait(until.elementLocated(By.css(buttonSelector)), 25000);
        const button = await driver.findElement(By.css(buttonSelector));

        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", button);
        await driver.sleep(1500);

        const isVisible = await driver.executeScript("return window.getComputedStyle(arguments[0]).display !== 'none' && arguments[0].offsetHeight > 0;", button);
        if (!isVisible) {
          console.warn(`⚠️ Skipping hidden button: ${buttonSelector}`);
          result.status = "Skipped (Hidden)";
          reportData.push(result);
          return;
        }

        const originalWindow = await driver.getWindowHandle();
        const originalUrl = await driver.getCurrentUrl();

        await button.click();
        await driver.sleep(5000);

        const windows = await driver.getAllWindowHandles();

        if (windows.length > 1) {
          for (let handle of windows) {
            if (handle !== originalWindow) {
              await driver.switchTo().window(handle);
              break;
            }
          }
          let newUrl = await driver.getCurrentUrl();
          console.log(`Opened new tab: ${newUrl}`);
          result.status = "Success (New Tab)";
          result.url = newUrl;
          await driver.close();
          await driver.switchTo().window(originalWindow);
          successCount++;
        } else {
          let newUrl = await driver.getCurrentUrl();
          if (newUrl === originalUrl) {
            console.error(`No navigation for button '${buttonSelector}'`);
            result.status = "No Navigation";
            failureCount++;
          } else {
            console.log(`Navigated to: ${newUrl} for button '${buttonSelector}'`);
            result.status = "Success";
            result.url = newUrl;
            successCount++;
          }
          await driver.navigate().back();
        }

        await driver.sleep(5000);
      } catch (error) {
        console.error(`Error with button '${buttonSelector}':`, error);
        result.status = `Error: ${error.message}`;
        failureCount++;
      } finally {
        reportData.push(result);
      }
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
      
    ];

    for (const selector of buttonSelectors) {
      console.log(`Checking button: ${selector}`);
      await clickButtonAndNavigateBack(selector);
    }

    await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");

  } finally {
    let endTime = new Date();
    let executionTime = ((endTime - startTime) / 1000).toFixed(2);

    let jsonReport = {
      date: startTime.toISOString(),
      executionTime: `${executionTime} seconds`,
      successCount,
      failureCount,
      results: reportData
    };

    let htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selenium Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; }
        h2 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .success { color: green; }
        .failure { color: red; }
        .skipped { color: orange; }
    </style>
</head>
<body>
    <h2>📝 Selenium Test Report</h2>
    <p><strong>Date:</strong> ${startTime.toISOString()}</p>
    <p><strong>Execution Time:</strong> ${executionTime} seconds</p>
    <p><strong>Success Count:</strong> <span class="success">${successCount}</span></p>
    <p><strong>Failure Count:</strong> <span class="failure">${failureCount}</span></p>

    <table>
        <tr>
            <th>#</th>
            <th>Button Selector</th>
            <th>Status</th>
            <th>URL</th>
        </tr>
        ${reportData.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.selector}</td>
            <td class="${item.status.includes('Success') ? 'success' : item.status.includes('Error') ? 'failure' : 'skipped'}">
                ${item.status}
            </td>
            <td>${item.url || 'N/A'}</td>
        </tr>`).join('')}
    </table>
</body>
</html>
    `;

    fs.writeFileSync('section-button-report.json', JSON.stringify(jsonReport, null, 2), 'utf8');
    fs.writeFileSync('section-button-report.html', htmlReport, 'utf8');

    console.log("\n**Reports Generated:**");
    console.log("section-button-report.json (Structured data)");
    console.log("section-button-report.html (Readable HTML report)");

    await driver.quit();
  }
})();