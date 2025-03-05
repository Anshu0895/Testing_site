// const { Builder, By, until } = require('selenium-webdriver');
// require('chromedriver');
// const { performance } = require('perf_hooks');
// const fs = require('fs');

// (async function responseTimeTesting() {
//   let driver = await new Builder().forBrowser('chrome').build();
//   let reportData = [];

//   try {
//     await driver.get('https://www.xenonstack.com/');
//     await driver.manage().window().setRect({ width: 1850, height: 1053 });

//     // Helper function to ensure element is clickable
//     const ensureClickable = async (element) => {
//       await driver.executeScript("arguments[0].scrollIntoView(true);", element);
//       await driver.wait(until.elementIsVisible(element), 10000);
//       await driver.wait(until.elementIsEnabled(element), 10000);
//     };

//     // Elements to Test
//     const elementsToTest = [
      
//       "#product-main-section-two .product-button > p",
//       // Add other selectors to test here
//     ];

//     for (let selector of elementsToTest) {
//       const start = performance.now();

//       try {
//         // Find and click the element
//         const element = await driver.findElement(By.css(selector));
//         await ensureClickable(element);
//         await driver.executeScript("arguments[0].click();", element); // Click using JavaScript

//         // Wait for navigation or response
//         await driver.wait(until.elementLocated(By.css('body')), 10000);

//         const duration = performance.now() - start;
//         console.log(`Response Time for click on ${selector}: ${duration.toFixed(2)}ms`);

//         // Save to report data
//         reportData.push({
//           button: selector,
//           responseTime: `${duration.toFixed(2)}ms`
//         });

//         // Navigate back to the original page
//         await driver.navigate().back();
//         await driver.wait(until.elementLocated(By.css('body')), 10000);
//       } catch (e) {
//         console.error(`Error clicking element ${selector}:`, e);
//         reportData.push({ button: selector, responseTime: "Error" });
//       }
//     }
//   } finally {
//     await driver.quit();
//     generateReports(reportData);
//   }
// })();

// // Function to generate JSON & HTML reports
// function generateReports(data) {
//   // Save JSON report
//   fs.writeFileSync("response_times.json", JSON.stringify(data, null, 2));
  
//   // Create HTML report
//   const htmlContent = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Response Time Report</title>
//     <style>
//       body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; }
//       table { width: 100%; border-collapse: collapse; }
//       th, td { border: 1px solid black; padding: 10px; text-align: left; }
//       th { background-color: #f2f2f2; }
//     </style>
//   </head>
//   <body>
//     <h2>Response Time Report</h2>
//     <table>
//       <tr><th>Button Selector</th><th>Response Time</th></tr>
//       ${data.map(row => `<tr><td>${row.button}</td><td>${row.responseTime}</td></tr>`).join("")}
//     </table>
//   </body>
//   </html>
//   `;
//   fs.writeFileSync("response_times.html", htmlContent);
//   console.log("Reports generated: response_times.json & response_times.html");
// }
const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const { performance } = require('perf_hooks');
const fs = require('fs');

(async function responseTimeTesting() {
  let driver = await new Builder().forBrowser('chrome').build();
  let reportData = [];

  // Define the accepted response time threshold in milliseconds
  const acceptedResponseTime = 2000; // 2000 ms = 2 seconds

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
      "#product-main-section-two .product-button > p",
      // Add other selectors to test here
    ];

    for (let selector of elementsToTest) {
      const start = performance.now();

      try {
        // Find and click the element
        const element = await driver.findElement(By.css(selector));
        await ensureClickable(element);
        await driver.executeScript("arguments[0].click();", element); // Click using JavaScript

        // Wait for navigation or response
        await driver.wait(until.elementLocated(By.css('body')), 10000);

        const duration = performance.now() - start;
        console.log(`Response Time for click on ${selector}: ${duration.toFixed(2)}ms`);

        // Determine the status based on the response time
        const status = duration <= acceptedResponseTime ? "Passed" : "Failed";
        const errorMessage = status === "Failed" ? `Response time exceeded accepted threshold of ${acceptedResponseTime} ms.` : "";

        // Save to report data
        reportData.push({
          button: selector,
          responseTime: `${duration.toFixed(2)}ms`,
          status,
          errorMessage
        });

        // Navigate back to the original page
        await driver.navigate().back();
        await driver.wait(until.elementLocated(By.css('body')), 10000);
      } catch (e) {
        console.error(`Error clicking element ${selector}:`, e);
        reportData.push({ button: selector, responseTime: "Error", status: "Failed", errorMessage: e.message });
      }
    }
  } finally {
    await driver.quit();
    generateReports(reportData);
  }
})();

// Function to generate JSON & HTML reports
function generateReports(data) {
  // Save JSON report
  fs.writeFileSync("response_times.json", JSON.stringify(data, null, 2));
  
  // Create HTML report
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Response Time Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid black; padding: 10px; text-align: left; }
      th { background-color: #f2f2f2; }
      .passed { color: green; }
      .failed { color: red; }
    </style>
  </head>
  <body>
    <h2>Response Time Report</h2>
    <table>
      <tr><th>Button Selector</th><th>Response Time</th><th>Status</th><th>Error Message</th></tr>
      ${data.map(row => `
      <tr>
        <td>${row.button}</td>
        <td>${row.responseTime}</td>
        <td class="${row.status === "Passed" ? "passed" : "failed"}">${row.status}</td>
        <td>${row.errorMessage || "N/A"}</td>
      </tr>`).join("")}
    </table>
  </body>
  </html>
  `;
  fs.writeFileSync("response_times.html", htmlContent);
  console.log("Reports generated: response_times.json & response_times.html");
}
