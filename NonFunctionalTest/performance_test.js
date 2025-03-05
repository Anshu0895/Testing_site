const { Builder, By, until } = require('selenium-webdriver');
const axios = require('axios');
const fs = require('fs');
require('chromedriver');

const logger = console;
const REPORT_FILE = 'performance_report.json';

async function pageLoader(driver) {
    try {
        await driver.wait(() => driver.executeScript("return document.readyState === 'complete'"), 10000);
        logger.info(' Page loaded successfully.');
    } catch (err) {
        logger.warn('⚠️ Page took too long to load. Stopping load manually.');
        await driver.executeScript("window.stop();");
    }
}

async function extractLinks(driver) {
    try {
        await driver.wait(until.elementLocated(By.tagName('body')), 5000);
        const elements = await driver.findElements(By.tagName('a'));
        let links = [];

        for (let element of elements) {
            let href = await element.getAttribute("href");
            if (href && href.includes("xenonstack.com")) {
                links.push(href);
            }
        }

        return [...new Set(links)]; // Remove duplicates
    } catch (err) {
        logger.warn(`⚠️ No links found on the page.`);
        return [];
    }
}

async function checkPagePerformance(driver, page) {
    let status = null;
    let loadTime = null;
    
    // Check HTTP status using Axios
    try {
        const response = await axios.head(page);
        status = response.status;
    } catch (err) {
        status = err.response ? err.response.status : 'Error';
    }

    try {
        const startTime = performance.now();
        await driver.get(page);
        await pageLoader(driver);
        const endTime = performance.now();

        loadTime = ((endTime - startTime) / 1000).toFixed(2);
        logger.info(`${page} - Status: ${status}, Load Time: ${loadTime}s`);
    } catch (err) {
        logger.error(`${page} failed to load.`);
        loadTime = 'Failed';
    }

    return { url: page, status, loadTime };
}

async function loadSpeedTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    let results = [];

    try {
        logger.info("Starting Performance Test...");
        await driver.get("https://www.xenonstack.com/");
        await pageLoader(driver);

        let pages = await extractLinks(driver);
        logger.info(`Found ${pages.length} internal pages.`);

        for (let page of pages) {
            let result = await checkPagePerformance(driver, page);
            results.push(result);
        }

        // Save results to JSON file
        fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
        logger.info(`Report saved as '${REPORT_FILE}'`);

    } finally {
        await driver.quit();
    }
}

loadSpeedTest().catch(error => {
    console.error(`Load test encountered an error: ${error}`);
});
