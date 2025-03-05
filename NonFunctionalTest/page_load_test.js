

const { Builder, By, until } = require('selenium-webdriver');
const { performance } = require('perf_hooks');
const fs = require('fs');
require('chromedriver');

(async function responseTimeTesting() {
  let driver = await new Builder().forBrowser('chrome').build();
  let startTime = new Date();
  let results = {
    date: startTime.toISOString(),
    executionTime: "",
    testResults: [],
  };

  // Define the accepted response time threshold in milliseconds
  const acceptedResponseTime = 2000; // 2000 ms = 2 seconds

  try {
    const urlsToTest = [
      'https://www.xenonstack.com/',
    ];

    for (let url of urlsToTest) {
      let urlResult = { url, responseTime: "", status: "Failed", errorMessage: "" };

      try {
        const start = performance.now();

        // Navigate to the URL
        await driver.get(url);

        // Wait for the page to load completely
        await driver.wait(until.elementLocated(By.css('body')), 10000);

        const duration = performance.now() - start;
        urlResult.responseTime = `${duration.toFixed(2)} ms`;

        // Check if the response time is within the accepted threshold
        if (duration <= acceptedResponseTime) {
          urlResult.status = "Passed";
        } else {
          urlResult.status = "Failed";
          urlResult.errorMessage = `Response time exceeded accepted threshold of ${acceptedResponseTime} ms.`;
        }

        console.log(`Response Time for ${url}: ${urlResult.responseTime} - Status: ${urlResult.status}`);
      } catch (error) {
        console.error(`Error testing ${url}:`, error);
        urlResult.errorMessage = error.message;
      }

      results.testResults.push(urlResult);
    }
  } finally {
    let endTime = new Date();
    results.executionTime = `${((endTime - startTime) / 1000).toFixed(2)} seconds`;

    // Generate JSON Report
    fs.writeFileSync('page-load-time-report.json', JSON.stringify(results, null, 2), 'utf8');

    // Generate HTML Report
    let htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Response Time Report</title>
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
    <h2>Response Time Test Report</h2>
    <p><strong>Date:</strong> ${results.date}</p>
    <p><strong>Execution Time:</strong> ${results.executionTime}</p>
    <table>
        <tr>
            <th>URL</th>
            <th>Response Time</th>
            <th>Status</th>
            <th>Error Message</th>
        </tr>
        ${results.testResults.map(result => `
        <tr>
            <td><a href="${result.url}" target="_blank">${result.url}</a></td>
            <td>${result.responseTime || "N/A"}</td>
            <td class="${result.status === "Passed" ? "passed" : "failed"}">${result.status}</td>
            <td>${result.errorMessage || "N/A"}</td>
        </tr>`).join("")}
    </table>
</body>
</html>
    `;

    fs.writeFileSync('page-load-time-report.html', htmlReport, 'utf8');

    console.log("\n📄 **Reports Generated:**");
    console.log("page-load-time-report.json (Structured data)");
    console.log("page-load-time-report.html (Readable HTML report)");

    await driver.quit();
  }
})();
