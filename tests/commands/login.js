const { test, expect } = require('@playwright/test');

// Array of usernames
const usernames = [
    "fe.testing+1704476354@proposify.com",
    "fe.testing+1704476354@proposify.com",
    "fe.testing+1693930230532@proposify.com",
    "fe.testing+1693930243096@proposify.com",
    "fe.testing+1693930457800@proposify.com",
    "fe.testing+1693932037148@proposify.com",
    "fe.testing+1693932054820@proposify.com",
    "fe.testing+1693932061438@proposify.com",
    "fe.testing+1700946230641@proposify.com",
    "fe.testing+1700946250596@proposify.com",
];

// Password for all users
const password = "CD9UdyCC3PrJV3C2v36h3EYJh*!.Pn";

// Track active usernames globally
let activeUsernames = new Set();

// Function to get an available username
function getAvailableUsername() {
    const availableUsername = usernames.find(username => !activeUsernames.has(username));

    if (!availableUsername) {
        console.log("Waiting for a user to become available...");
        return;
    }
    
    activeUsernames.add(availableUsername);
    return availableUsername;
}

// Function to release a username
async function releaseUsername(username) {
    activeUsernames.delete(username);
    if (usernameQueue.length > 0) {
        // Resolve the next waiting promise in the queue, making a user available
        const nextUserResolve = usernameQueue.shift();
        nextUserResolve(username);
    }
}



// Login function for a single user
async function testLogin(page) {
    let username;
    let startTime = Date.now();
    const maxWaitTime = 30 * 1000; // 30 seconds in milliseconds
    
   while (true) {
        username = getAvailableUsername();
        if (username) break;

        // Check if maximum wait time has been exceeded
        if (Date.now() - startTime > maxWaitTime) {
            console.log("Timeout reached. No usernames available.");
            return; // Exit the function if timeout reached
        }

        console.log("Waiting for a user to become available...");
        // Wait for 5 seconds before trying again
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log(`Running login for: ${username}`);

    try {
        // Go to login page
        await page.goto('https://app.proposify.net/login');

        // Fill in the login form
        await expect(page.locator('[name="email"]')).toBeVisible({ timeout: 10000 });
        await page.locator('[name="email"]').fill(username);
        await page.locator('[name="password"]').fill(password);

        // Submit the login form
        await page.getByRole('button', { name: 'Login' }).click();

        // Wait for the "New Document" button to be visible
        await page.getByRole('button', { name: 'New Document' }).click();

        // Select the last dropdown menu and click on 'Try Editor 3.0'
        let newDocumentDropdown = await page.locator('.MuiPaper-root').last();
        await expect(newDocumentDropdown).toBeVisible();
        await newDocumentDropdown.locator('[role="menuitem"]').getByText('Try Editor 3.0').click();

        // Wait for the modal to appear and click 'Start from scratch'
        let modalLocator = await page.locator('[role="dialog"]').filter({ hasText: 'Select a template' });
        await modalLocator.getByRole('button', { name: 'Start from scratch' }).click();

        // Click on the user avatar to open the user menu
        await page.locator('[data-testid="avatar-button"]').click();
        let userDropdownMenu = await page.locator('[class*="ant-dropdown avatar-dropdown ant-dropdown-placement-bottomRight "]');
        await expect(userDropdownMenu).toBeVisible();

        // Logout by selecting 'Logout' from the dropdown menu
        await userDropdownMenu.locator('[role="menuitem"]').filter({ hasText: 'Logout' }).click();
    } catch (error) {
        console.error(`Test failed for ${username}:`, error);
        throw error;
    } finally {
        // Cleanup: Remove the username from the activeUsernames set after the test finishes
        activeUsernames.delete(username);
        console.log(`Cleanup: Removed ${username} from activeUsernames.`);
    }
}

module.exports = {
    testLogin
};
