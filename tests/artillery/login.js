const { testLogin, cleanup } = require("../commands/login");

async function beforeScenario(context) {
  const { page } = context;

  // Apply network conditions (throttling) 
  await page.emulateNetworkConditions({
    download: 1 * 1024 * 1024, // 1 Mbps download speed
    upload: 1 * 1024 * 1024,   // 1 Mbps upload speed
    latency: 100,              // 100ms latency
  });
}

async function artilleryScript(page) {
    console.log("artilleryScript is being executed");
    try {
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
