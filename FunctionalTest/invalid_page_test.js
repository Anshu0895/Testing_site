const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
require('chromedriver');

(async function testInvalidPage() {
  let driver = await new Builder().forBrowser('chrome').build();
  let startTime = new Date();
  let reportData = {
    date: startTime.toISOString(),
    executionTime: "",
    status: "Failed",
    urlTested: "https://xenonstack.com/page--not-exist",
    errorMessage: "",
  };

  try {
    await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 60000, script: 60000 });
    await driver.get(reportData.urlTested);
    await driver.manage().window().setRect({ width: 1850, height: 1053 });

    console.info("Checking 404 Error Handling");

    const pageLoader = async (driver) => {
      await driver.wait(until.titleIs(''), 10000);
    };

    await pageLoader(driver);

    const title = (await driver.getTitle()).toLowerCase();
    const src = (await driver.getPageSource()).toLowerCase();

    if (title.includes('404') || src.includes('not found')) {
      console.info("404 page correctly displayed.");
      reportData.status = "Passed";
    } else {
      console.error("404 page is missing or incorrect!");
      reportData.status = "Failed";
      reportData.errorMessage = "Expected 404 error page but didn't find expected indicators.";
    }
  } catch (error) {
    console.error("Error occurred:", error);
    reportData.status = "Error";
    reportData.errorMessage = error.message;
  } finally {
    let endTime = new Date();
    reportData.executionTime = `${((endTime - startTime) / 1000).toFixed(2)} seconds`;

    // Generate JSON Report
    fs.writeFileSync('404-test-report.json', JSON.stringify(reportData, null, 2), 'utf8');

    // Generate HTML Report
    let htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; }
        h2 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .passed { color: green; }
        .failed { color: red; }
    </style>
</head>
<body>
    <h2>404 Page Test Report</h2>
    <p><strong>Date:</strong> ${reportData.date}</p>
    <p><strong>Execution Time:</strong> ${reportData.executionTime}</p>
    <p><strong>Tested URL:</strong> <a href="${reportData.urlTested}" target="_blank">${reportData.urlTested}</a></p>
    <p><strong>Status:</strong> <span class="${reportData.status === "Passed" ? "passed" : "failed"}">${reportData.status}</span></p>
    ${reportData.errorMessage ? `<p><strong>Error Message:</strong> ${reportData.errorMessage}</p>` : ""}
</body>
</html>
    `;

    fs.writeFileSync('404-test-report.html', htmlReport, 'utf8');

    console.log("\n**Reports Generated:**");
    console.log("404-test-report.json (Structured data)");
    console.log("404-test-report.html (Readable HTML report)");

    await driver.quit();
  }
})();