const { testLogin, cleanup } = require("../commands/login");
const { chromium } = require('playwright');

async function artilleryScript(page) {
    console.log("artilleryScript is being executed");
    try {
        // Apply network throttling via CDP (Chromium DevTools Protocol)
        const networkConditions = {
            offline: false,
            downloadThroughput: (1 * 1024 * 1024) / 8,  // 1 Mbps download speed (in bytes/s)
            uploadThroughput: (1 * 1024 * 1024) / 8,    // 1 Mbps upload speed (in bytes/s)
            latency: 100,  // 100ms latency
        };
        // Create a new CDP session
        const context = page.context(); // Get the context from the page
        const session = await context.newCDPSession(page); // Create CDP session from the page context
        
        // Send the command to emulate network conditions
        await session.send('Network.emulateNetworkConditions', networkConditions);
        
        // Proceed with the test
        await testLogin(page);
        console.log("artilleryScript completed successfully");
    } catch (error) {
        console.error("Error in artilleryScript:", error);
    }
}

module.exports = {
    artilleryScript,
    cleanup
};
