const { testLogin, cleanup } = require("../commands/login");
async function artilleryScript(page) {
    console.log("artilleryScript is being executed");
    await testLogin(page);
}

module.exports = {
    artilleryScript,
    cleanup
};
