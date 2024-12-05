const { testLogin, cleanup } = require("../commands/login");

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
