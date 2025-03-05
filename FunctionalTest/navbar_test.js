

const fs = require("fs");
const { Builder, By, until } = require("selenium-webdriver");
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
    fs.writeFileSync("navbar-test-report.json", JSON.stringify(testResults, null, 2));
    console.log("Test report saved as navbar-test-report.json");
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
    fs.writeFileSync("navbar-test-report.html", htmlContent);
    console.log("Test report saved as navbar-test-report.html");
}

(async function() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        // Function to ensure element is interactable
        const ensureInteractable = async (element) => {
            await driver.executeScript("arguments[0].scrollIntoView(true);", element);
            await driver.wait(until.elementIsVisible(element), 10000);
            await driver.wait(async () => {
                const visible = await element.isDisplayed();
                const enabled = await element.isEnabled();
                return visible && enabled;
            }, 10000);
        };

        // Custom function to simulate scroll action
        const scrollToSection = async (sectionId) => {
            await driver.executeScript(`document.getElementById('${sectionId}').scrollIntoView({ behavior: 'smooth' });`);
        };

        await driver.get("https://www.xenonstack.com/");
        await driver.manage().window().setRect({ width: 1850, height: 1053 });

        // Testing Navbar Items
        console.log("Testing Navbar items...");
        let navItems = [
            { css: ".nav-li.logo-li img", text: "Home", sectionId: null }, // Logo
            { css: ".platform-li > p", text: "Foundry", sectionId: 'product-main-section-one' },
            { css: ".nav-li:nth-child(2) > p", text: "Neural AI", sectionId: 'product-main-section-two' },
            { css: ".nav-li:nth-child(3) > p", text: "NexaStack", sectionId: 'product-main-section-four' },
            { css: ".nav-li:nth-child(4) > p", text: "ElixirData", sectionId: 'product-main-section-five' },
            { css: ".nav-li:nth-child(5) > p", text: "MetaSecure", sectionId: 'product-main-section-three' },
            { css: ".nav-li:nth-child(6) > p", text: "Akira AI", sectionId: 'product-main-section-six' },
            { css: ".nav-li:nth-child(7) > p", text: "XAI", sectionId: 'product-main-section-six' },
        ];

        for (let item of navItems) {
            let element = await driver.wait(until.elementLocated(By.css(item.css)), 10000);
            await ensureInteractable(element);

            if (item.text === "Home") {
                await element.click();
                console.log(`Clicked ${item.text}`);

                // Adding a pause to allow the page to reload
                await driver.sleep(2000);

                const currentUrl = await driver.getCurrentUrl();
                if (currentUrl === "https://www.xenonstack.com/") {
                    logResult("Navbar Home", "PASS", `Navbar item ${item.text} refreshed the page.`);
                } else {
                    logResult("Navbar Home", "FAIL", `Navbar item ${item.text} did not refresh the page.`);
                }
            } else {
                await element.click();
                console.log(`Clicked ${item.text}`);
                
                if (item.sectionId) {
                    await scrollToSection(item.sectionId);
                    console.log(`Scrolled to ${item.text} section`);

                    // Verify scroll action using getBoundingClientRect and browser context for viewport height
                    const sectionPosition = await driver.executeScript(`
                        const section = document.getElementById('${item.sectionId}');
                        return section.getBoundingClientRect();
                    `);
                    const viewportHeight = await driver.executeScript('return window.innerHeight;');
                    const scrollPosition = await driver.executeScript('return window.scrollY;');

                    if (scrollPosition < sectionPosition.top - viewportHeight / 2 || scrollPosition > sectionPosition.top + viewportHeight / 2) {
                        logResult(`Navbar ${item.text}`, "FAIL", `Failed to scroll to ${item.text} section.`);
                    } else {
                        logResult(`Navbar ${item.text}`, "PASS", `Successfully scrolled to ${item.text} section.`);
                    }
                }
            }
        }

        let getStartedButton = await driver.findElement(By.linkText("Get Started"));
        await ensureInteractable(getStartedButton);
        await getStartedButton.click();
        logResult("Navbar Get Started", "PASS", "Clicked Get Started");

        let closeButton = await driver.findElement(By.css(".close-drawer > img"));
        await ensureInteractable(closeButton);
        await closeButton.click();
        logResult("Navbar Close Drawer", "PASS", "Closed drawer");

        console.log("Navbar test completed.");
    } finally {
        await driver.quit();
        saveJsonReport();
        saveHtmlReport();
    }
})();
