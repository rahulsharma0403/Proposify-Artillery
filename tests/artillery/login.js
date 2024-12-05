async function artilleryScript(page) {
    console.log("artilleryScript is being executed");
    try {
        await testLogin(page);
        console.log("artilleryScript completed successfully");
    } catch (error) {
        console.error("Error in artilleryScript:", error);
    }
}

async function cleanup() {
    console.log("Starting cleanup...");
    // Perform any necessary cleanup actions here
    console.log("Cleanup completed.");
}

module.exports = {
    artilleryScript,
    cleanup
};
