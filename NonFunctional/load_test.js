const axios = require('axios');
const { performance } = require('perf_hooks');

const VUs = 5; // Number of virtual users further reduced to avoid rate limiting
const DURATION = 30000; // Test duration in milliseconds (30s)
const INITIAL_SLEEP_INTERVAL = 1000; // Initial sleep interval between requests in milliseconds (1s)
const MAX_SLEEP_INTERVAL = 10000; // Maximum sleep interval in milliseconds (10s)

// Function to perform the load test with exponential backoff
async function loadTest() {
    const startTime = Date.now();
    const endTime = startTime + DURATION;
    let requestPromises = [];
    let sleepInterval = INITIAL_SLEEP_INTERVAL;

    while (Date.now() < endTime) {
        for (let i = 0; i < VUs; i++) {
            const requestPromise = (async () => {
                const start = performance.now();
                try {
                    const response = await axios.get('https://www.xenonstack.com/');
                    const duration = performance.now() - start;

                    const status = response.status === 200;
                    const responseTime = duration < 3000;

                    console.log(`Load Test: Status is 200: ${status}`);
                    console.log(`Load Test: Response time < 3s: ${responseTime}`);
                    
                    // Reset sleep interval after a successful request
                    sleepInterval = INITIAL_SLEEP_INTERVAL;
                } catch (error) {
                    if (error.response && error.response.status === 429) {
                        console.error(`Request failed: Rate limited (status: ${error.response.status}). Retrying with backoff.`);
                        sleepInterval = Math.min(sleepInterval * 2, MAX_SLEEP_INTERVAL); // Exponential backoff
                    } else {
                        console.error(`Request failed: ${error.message}`);
                    }
                }
            })();

            requestPromises.push(requestPromise);
        }

        await new Promise(resolve => setTimeout(resolve, sleepInterval)); // Sleep for the interval
    }

    // Wait for all requests to complete
    await Promise.all(requestPromises);
}

// Run the load test
loadTest().then(() => {
    console.log('Load test completed.');
}).catch(error => {
    console.error(`Load test encountered an error: ${error}`);
});
