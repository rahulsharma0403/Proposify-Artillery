const { testLogin, cleanup } = require("../commands/login");

async function beforeScenario(context) {
  const { page } = context;

  // Log the throttle settings to verify they are applied
  console.log('Applying network conditions (throttling)...');
  const networkConditions = {
    download: 1 * 1024 * 1024, // 1 Mbps download speed
    upload: 1 * 1024 * 1024,   // 1 Mbps upload speed
    latency: 100,              // 100ms latency
  };
  console.log('Network conditions:', networkConditions);

  // Apply network conditions (throttling) 
  await page.emulateNetworkConditions(networkConditions);

  console.log('Network conditions applied.');
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
