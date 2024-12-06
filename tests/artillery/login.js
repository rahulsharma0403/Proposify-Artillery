const { testLogin, cleanup } = require("../commands/login");

async function artilleryScript(page) {
    console.log("artilleryScript is being executed");
    try {
        // Apply network throttling
        const networkConditions = {
            download: 1 * 1024 * 1024, // 1 Mbps download speed
            upload: 1 * 1024 * 1024,   // 1 Mbps upload speed
            latency: 100,              // 100ms latency
        };
        console.log('Applying network conditions:', networkConditions);
        await page.emulateNetworkConditions(networkConditions);
        console.log('Network conditions applied.');

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
