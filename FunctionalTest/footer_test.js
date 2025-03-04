// const { Builder, By, until } = require('selenium-webdriver');
// require('chromedriver');

// (async function() {
//   let driver = await new Builder().forBrowser('chrome').build();
//   try {
//     // Function to ensure element is interactable
//     const ensureInteractable = async (element) => {
//       await driver.executeScript("arguments[0].scrollIntoView(true);", element);
//       await driver.wait(until.elementIsVisible(element), 10000);
//       await driver.wait(async () => {
//         const visible = await element.isDisplayed();
//         const enabled = await element.isEnabled();
//         return visible && enabled;
//       }, 10000);
//     };

//     await driver.get("https://xenonstack.com/");
//     await driver.manage().window().setRect({ width: 1850, height: 1053 });

//     // Extracting Footer Links
//     const extractLinks = async (driver, section) => {
//       const elements = await driver.findElements(By.css(`${section} a`));
//       return elements;
//     };

//     // Check external link
//     const checkExternalLink = async (href, linkText) => {
//       const response = await driver.executeAsyncScript(
//         `const callback = arguments[arguments.length - 1];
//          fetch("${href}", { method: "HEAD" })
//            .then(response => callback(response.status))
//            .catch(() => callback(500));`
//       );
//       if (response === 200) {
//         console.log(`External link '${linkText}' is valid. [HTTP ${response}]`);
//       } else if (response === 999) {
//         console.log(`LinkedIn blocks bot requests (999) or is down for some reason. Marking as valid.`);
//       } else {
//         console.error(`External link '${linkText}' is invalid. [HTTP ${response}]`);
//       }
//     };

//     // Check internal link
//     const checkInternalLink = async (driver, wait, link, linkText, oldUrl) => {
//       await ensureInteractable(link);
//       await link.click();
//       await driver.sleep(2000);
//       const newUrl = await driver.getCurrentUrl();
//       if (newUrl !== oldUrl) {
//         console.log(`Internal link '${linkText}' is valid.`);
//         await driver.navigate().back();
//         await driver.sleep(2000);
//       } else {
//         console.error(`Internal link '${linkText}' did not navigate.`);
//       }
//     };

//     // Testing Footer Items
//     console.log("Testing Footer items...");
//     let links = await extractLinks(driver, "footer");
//     if (links.length === 0) {
//       console.error("FOOTER TEST FAILED - No links found in the footer!");
//       return;
//     }

//     const totalLinks = links.length;
//     console.log(`Total Footer Links Found: ${totalLinks}`);
//     let idx = 0;

//     while (idx < totalLinks) {
//       let retries = 2;
//       while (retries > 0) {
//         try {
//           links = await extractLinks(driver, "footer");
//           if (idx >= links.length) {
//             console.warn(`Skipping missing link at index ${idx}`);
//             break;
//           }

//           const link = links[idx];
//           let linkText = await link.getText().trim();
//           const href = await link.getAttribute("href");

//           if (!linkText) {
//             try {
//               const img = await link.findElement(By.tagName("img"));
//               const altText = await img.getAttribute("alt");
//               if (altText) {
//                 linkText = altText.trim();
//               }
//             } catch (NSE) {
//               // No alt text found
//             }
//             if (!linkText) {
//               linkText = "N/A";
//             }
//           }

//           if (!href) {
//             console.error(`Skipping '${linkText}' - No href attribute.`);
//             break;
//           }

//           console.log(`Checking Footer Link ${idx + 1}/${totalLinks}: ${href} -> ${linkText}`);

//           if (!href.includes("xenonstack.com")) {
//             await checkExternalLink(href, linkText);
//           } else {
//             const oldUrl = await driver.getCurrentUrl();
//             await checkInternalLink(driver, ensureInteractable, link, linkText, oldUrl);
//           }
//           break;

//         } catch (SER) {
//           retries -= 1;
//           console.warn("Stale element error. Retrying...");
//         }
//       }
//       idx += 1;
//     }

//     console.log("Footer Test Completed Successfully.");
//   } finally {
//     await driver.quit();
//   }
// })();


const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

// Helper function to ensure element is interactable
const ensureInteractable = async (driver, element) => {
  await driver.executeScript("arguments[0].scrollIntoView(true);", element);
  await driver.wait(until.elementIsVisible(element), 10000);
  await driver.wait(async () => {
    const visible = await element.isDisplayed();
    const enabled = await element.isEnabled();
    return visible && enabled;
  }, 10000);
};

// Helper function to extract links
const extractLinks = async (driver, section) => {
  const elements = await driver.findElements(By.css(`${section} a`));
  return elements;
};

// Helper function to check external link with retries
const checkExternalLink = async (driver, href, linkText) => {
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await driver.executeAsyncScript(
        `const callback = arguments[arguments.length - 1];
         fetch("${href}", { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0" } })
           .then(response => callback(response.status))
           .catch(() => callback(500));`
      );
      if (response === 200) {
        console.log(`External link '${linkText}' is valid. [HTTP ${response}]`);
      } else if (response === 999) {
        console.log(`LinkedIn blocks bot requests (999) or is down for some reason. Marking as valid.`);
      } else {
        console.error(`External link '${linkText}' is invalid. [HTTP ${response}]`);
      }
      break; // Success
    } catch (e) {
      if (e.name === 'ScriptTimeoutError') {
        retries--;
        console.warn(`Retrying... (${3 - retries}/3)`);
        await driver.sleep(2000); // Add delay between retries
      } else {
        throw e;
      }
    }
  }
};

// Helper function to check internal link with retries
const checkInternalLink = async (driver, link, linkText, oldUrl) => {
  let retries = 3;
  while (retries > 0) {
    try {
      await ensureInteractable(driver, link);
      await driver.executeScript("arguments[0].scrollIntoView(true);", link);
      await driver.wait(until.elementIsVisible(link), 10000);
      await driver.sleep(1000); // Add delay to ensure element is ready
      await link.click();
      await driver.sleep(2000);
      const newUrl = await driver.getCurrentUrl();
      if (newUrl !== oldUrl) {
        console.log(`Internal link '${linkText}' is valid.`);
        await driver.navigate().back();
        await driver.sleep(2000);
      } else {
        console.error(`Internal link '${linkText}' did not navigate.`);
      }
      break; // Success
    } catch (e) {
      if (e.name === 'ElementClickInterceptedError' || e.name === 'ElementNotInteractableException') {
        retries--;
        console.warn(`Retrying... (${3 - retries}/3)`);
        await driver.sleep(2000); // Add delay between retries
      } else {
        throw e;
      }
    }
  }
};

// Helper function to refresh element reference if stale
const refreshElementReference = async (driver, cssSelector) => {
  try {
    return await driver.findElement(By.css(cssSelector));
  } catch (e) {
    if (e.name === 'StaleElementReferenceException') {
      return await driver.findElement(By.css(cssSelector));
    }
    throw e;
  }
};

(async function() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    // Set timeouts
    await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 60000, script: 60000 });

    await driver.get("https://xenonstack.com/");
    await driver.manage().window().setRect({ width: 1850, height: 1053 });

    // Testing Footer Items
    console.log("Testing Footer items...");
    let links = await extractLinks(driver, "footer");
    if (links.length === 0) {
      console.error("FOOTER TEST FAILED - No links found in the footer!");
      return;
    }

    const totalLinks = links.length;
    console.log(`Total Footer Links Found: ${totalLinks}`);
    let idx = 0;

    while (idx < totalLinks) {
      let retries = 2;
      while (retries > 0) {
        try {
          links = await extractLinks(driver, "footer");
          if (idx >= links.length) {
            console.warn(`Skipping missing link at index ${idx}`);
            break;
          }

          let link = links[idx];
          let linkText = (await link.getText()).trim();
          const href = await link.getAttribute("href");

          if (!linkText) {
            try {
              const img = await link.findElement(By.tagName("img"));
              const altText = await img.getAttribute("alt");
              if (altText) {
                linkText = altText.trim();
              }
            } catch (e) {
              if (e.name !== 'NoSuchElementException') {
                throw e;
              }
            }
            if (!linkText) {
              linkText = "N/A";
            }
          }

          if (!href) {
            console.error(`Skipping '${linkText}' - No href attribute.`);
            break;
          }

          console.log(`Checking Footer Link ${idx + 1}/${totalLinks}: ${href} -> ${linkText}`);

          if (!href.includes("xenonstack.com")) {
            await checkExternalLink(driver, href, linkText);
          } else {
            const oldUrl = await driver.getCurrentUrl();
            await checkInternalLink(driver, link, linkText, oldUrl);
          }

          break; // Exit retry loop after success
        } catch (e) {
          if (e.name === 'StaleElementReferenceException' || e.name === 'NoSuchElementException') {
            console.warn(`Encountered ${e.name}. Retrying... (${3 - retries + 1}/3)`);
            retries--;
            await driver.sleep(2000); // Add delay between retries
          } else {
            throw e;
          }
        }
      }

      idx++;
    }

    console.log("Footer link testing completed.");
  } finally {
    await driver.quit();
  }
})();
