

const fs = require("fs");
const axios = require("axios");
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
    fs.writeFileSync("Form-test-report.json", JSON.stringify(testResults, null, 2));
    console.log("Test report saved as Form-test-report.json");
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
    fs.writeFileSync("Form-test-report.html", htmlContent);
    console.log("Test report saved as Form-test-report.html");
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

        await driver.get("https://www.xenonstack.com/");
        await driver.manage().window().setRect({ width: 1850, height: 1053 });
        let startButton = await driver.wait(until.elementLocated(By.css("a > span")), 10000);
        await ensureInteractable(startButton);
        await startButton.click();

        // Fill in valid data
        console.log("Filling in valid data...");
        let firstname = await driver.wait(until.elementLocated(By.id("Firstname")), 10000);
        await ensureInteractable(firstname);
        await firstname.sendKeys("swap");

        let lastname = await driver.wait(until.elementLocated(By.id("Lastname")), 10000);
        await ensureInteractable(lastname);
        await lastname.sendKeys("nil");

        let emailid = await driver.wait(until.elementLocated(By.id("emailid")), 10000);
        await ensureInteractable(emailid);
        await emailid.sendKeys("swap@gmail.com");

        let contactnumber = await driver.wait(until.elementLocated(By.id("contactnumber")), 10000);
        await ensureInteractable(contactnumber);
        await contactnumber.sendKeys("7865432112");

        let companyname = await driver.wait(until.elementLocated(By.id("companyname")), 10000);
        await ensureInteractable(companyname);
        await companyname.sendKeys("xyz");

        let enterpriseIndustry = await driver.wait(until.elementLocated(By.id("enterpriseIndustry")), 10000);
        await ensureInteractable(enterpriseIndustry);
        await enterpriseIndustry.click();

        let dropdown = await driver.findElement(By.id("enterpriseIndustry"));
        let option = await dropdown.findElement(By.xpath("//option[. = 'Games and Sports']"));
        await ensureInteractable(option);
        await option.click();

        let proceedButton = await driver.findElement(By.css(".next-step-button:nth-child(1) > p"));
        await ensureInteractable(proceedButton);
        await proceedButton.click();

        await driver.findElement(By.css("#agenticaiPlatform .answers:nth-child(1) > p")).click();
        await driver.findElement(By.css("#companySegment .answers:nth-child(1) > p")).click();
        await driver.findElement(By.css("#primaryFocus .answers:nth-child(1) > p")).click();
        await driver.findElement(By.css("#aiUsecase .answers:nth-child(1) > p")).click();
        await driver.findElement(By.css("#primaryChallenge .answers:nth-child(1) > p")).click();
        await driver.findElement(By.css("#companyInfra .answers:nth-child(1)")).click();
        await driver.findElement(By.css("#dataPlatform .answers:nth-child(1) > p")).click();
        await driver.findElement(By.css("#aiTransformation .answers:nth-child(1) > p")).click();
        await driver.findElement(By.css("#solution .answers:nth-child(1) > p")).click();
        await driver.findElement(By.css(".next-step-button:nth-child(2) > p")).click();
        await driver.findElement(By.css(".close-drawer > img")).click();

        logResult("Valid Data Submission", "PASS", "Valid data submission test passed.");

        // Validation for no input in the form
        console.log("Testing form submission with no input...");
        await driver.get("https://www.xenonstack.com/");
        await driver.manage().window().setRect({ width: 1850, height: 1053 });
        startButton = await driver.wait(until.elementLocated(By.css("a > span")), 10000);
        await ensureInteractable(startButton);
        await startButton.click();

        firstname = await driver.findElement(By.id("Firstname"));
        await ensureInteractable(firstname);
        await firstname.click();

        lastname = await driver.findElement(By.id("Lastname"));
        await ensureInteractable(lastname);
        await lastname.click();

        emailid = await driver.findElement(By.id("emailid"));
        await ensureInteractable(emailid);
        await emailid.click();

        contactnumber = await driver.findElement(By.id("contactnumber"));
        await ensureInteractable(contactnumber);
        await contactnumber.click();

        companyname = await driver.findElement(By.id("companyname"));
        await ensureInteractable(companyname);
        await companyname.click();

        enterpriseIndustry = await driver.findElement(By.id("enterpriseIndustry"));
        await ensureInteractable(enterpriseIndustry);
        await enterpriseIndustry.click();

        let formStepOne = await driver.findElement(By.id("form-step-one"));
        await ensureInteractable(formStepOne);
        await formStepOne.click();

        proceedButton = await driver.findElement(By.css(".next-step-button:nth-child(1) > p"));
        await ensureInteractable(proceedButton);
        await proceedButton.click();

        // Check for validation messages
        let errors = await driver.findElements(By.className("error-message"));
        if (errors.length > 0 && (await Promise.all(errors.map(error => error.isDisplayed()))).some(isDisplayed => isDisplayed)) {
            logResult("Required Field Validation", "PASS", "Required field validation test passed.");
        } else {
            logResult("Required Field Validation", "FAIL", "Error message did not appear. Required field validation test failed.");
        }

        // Fill in the form with incorrect phone number 
        console.log("Testing form submission with incorrect phone number...");
        await driver.get("https://www.xenonstack.com/");
        await driver.manage().window().setRect({ width: 1850, height: 1053 });
        startButton = await driver.wait(until.elementLocated(By.css("a > span")), 10000);
        await ensureInteractable(startButton);
        await startButton.click();

        firstname = await driver.wait(until.elementLocated(By.id("Firstname")), 10000);
        await ensureInteractable(firstname);
        await firstname.sendKeys("swap");

        lastname = await driver.wait(until.elementLocated(By.id("Lastname")), 10000);
        await ensureInteractable(lastname);
        await lastname.sendKeys("nil");

        emailid = await driver.wait(until.elementLocated(By.id("emailid")), 10000);
        await ensureInteractable(emailid);
        await emailid.sendKeys("swap@gmail.com");

        contactnumber = await driver.wait(until.elementLocated(By.id("contactnumber")), 10000);
        await ensureInteractable(contactnumber);
        await contactnumber.sendKeys("78654321124444");

        companyname = await driver.wait(until.elementLocated(By.id("companyname")), 10000);
        await ensureInteractable(companyname);
        await companyname.sendKeys("xyz");

        enterpriseIndustry = await driver.wait(until.elementLocated(By.id("enterpriseIndustry")), 10000);
        await ensureInteractable(enterpriseIndustry);
        await enterpriseIndustry.click();

        dropdown = await driver.findElement(By.id("enterpriseIndustry"));
        option = await dropdown.findElement(By.xpath("//option[. = 'Games and Sports']"));
        await ensureInteractable(option);
        await option.click();
    
        proceedButton = await driver.findElement(By.css(".next-step-button:nth-child(1) > p"));
        await ensureInteractable(proceedButton);
        await proceedButton.click();
    
        // Check for validation messages
        errors = await driver.findElements(By.className("error-message"));
        if (errors.length > 0 && (await Promise.all(errors.map(error => error.isDisplayed()))).some(isDisplayed => isDisplayed)) {
            logResult("Input Validation", "PASS", "Input validation test passed.");
        } else {
            logResult("Input Validation", "FAIL", "Error message did not appear. Input validation test failed.");
        }
    
        console.log("All tests completed.");
    } finally {
        await driver.quit();
        saveJsonReport();
        saveHtmlReport();
    }
    })();
    