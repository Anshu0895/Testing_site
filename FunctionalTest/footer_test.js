
const fs = require("fs");
const axios = require("axios");
const { Builder, By } = require("selenium-webdriver");
require("chromedriver");

let testResults = [];

function logResult(testName, status, message) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        testName,
        status,
        message,
    };
    testResults.push(logEntry);
    console.log(`[${status}] ${testName}: ${message}`);
}

function saveJsonReport() {
    fs.writeFileSync("Footer-test-report.json", JSON.stringify(testResults, null, 2));
    console.log("Test report saved as Footer-test-report.json");
}

function saveHtmlReport() {
    let htmlContent = `
    <html>
    <head>
        <title>Automation Test Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .PASS { color: green; }
            .FAIL, .ERROR { color: red; }
        </style>
    </head>
    <body>
        <h1>Automation Test Report</h1>
        <table>
            <tr>
                <th>Timestamp</th>
                <th>Test Name</th>
                <th>Status</th>
                <th>Message</th>
            </tr>
    `;
    
    testResults.forEach(result => {
        htmlContent += `
            <tr>
                <td>${result.timestamp}</td>
                <td>${result.testName}</td>
                <td class="${result.status}">${result.status}</td>
                <td>${result.message}</td>
            </tr>
        `;
    });
    
    htmlContent += `</table></body></html>`;
    fs.writeFileSync("test-report.html", htmlContent);
    console.log("Test report saved as test-report.html");
}

async function checkExternalLink(href, linkText) {
    let retries = 3;
    while (retries > 0) {
        try {
            const response = await axios.get(href, { timeout: 15000 });
            const statusCode = response.status;

            if (statusCode >= 200 && statusCode < 400) {
                logResult(linkText, "PASS", `External link '${href}' is valid.`);
            } else {
                logResult(linkText, "FAIL", `External link '${href}' returned HTTP ${statusCode}.`);
            }
            return;
        } catch (error) {
            retries--;
            if (retries === 0) {
                logResult(linkText, "ERROR", `Error checking external link '${href}': ${error.message}`);
            }
        }
    }
}

async function checkInternalLink(driver, link, linkText, oldUrl) {
    try {
        await link.click();
        await driver.sleep(2000);
        const newUrl = await driver.getCurrentUrl();

        if (newUrl !== oldUrl) {
            logResult(linkText, "PASS", `Internal link '${linkText}' navigated successfully.`);
        } else {
            logResult(linkText, "FAIL", `Internal link '${linkText}' did not navigate.`);
        }

        await driver.navigate().back();
        await driver.sleep(2000);
    } catch (e) {
        logResult(linkText, "ERROR", `Error testing internal link '${linkText}': ${e.message}`);
    }
}

(async function runTest() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 60000, script: 60000 });
        await driver.get("https://xenonstack.com/");
        await driver.manage().window().setRect({ width: 1850, height: 1053 });

        console.log("Testing Footer links...");
        let links = await driver.findElements(By.css("footer a"));
        if (links.length === 0) {
            logResult("Footer Links", "FAIL", "No links found in the footer.");
            return;
        }

        logResult("Footer Links", "INFO", `Total Footer Links Found: ${links.length}`);

        for (let i = 0; i < links.length; i++) {
            let retries = 2;
            while (retries > 0) {
                try {
                    links = await driver.findElements(By.css("footer a"));
                    if (i >= links.length) break;

                    let link = links[i];
                    let linkText = (await link.getText()).trim();
                    const href = await link.getAttribute("href");

                    if (!href) {
                        logResult(linkText, "FAIL", "No href attribute found.");
                        break;
                    }

                    console.log(`Checking Footer Link ${i + 1}/${links.length}: ${href}`);

                    if (!href.includes("xenonstack.com")) {
                        await checkExternalLink(href, linkText);
                    } else {
                        const oldUrl = await driver.getCurrentUrl();
                        await checkInternalLink(driver, link, linkText, oldUrl);
                    }

                    break;
                } catch (e) {
                    retries--;
                    if (retries === 0) logResult("Footer Links", "ERROR", `Failed to process link: ${e.message}`);
                }
            }
        }

        console.log("Footer link testing completed.");
    } finally {
        await driver.quit();
        saveJsonReport();
        saveHtmlReport();
    }
})();