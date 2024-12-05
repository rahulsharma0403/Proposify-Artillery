const { test, expect } = require('@playwright/test');
const redis = require('redis');

// Create a Redis client
const client = redis.createClient();

// Retrieve secrets from environment variables
const usernames = process.env.USERNAMES ? process.env.USERNAMES.split(',') : [];
const password = process.env.PASSWORD;

// Initialize the Redis queue with available usernames
async function initializeUsernameQueue() {
    for (const username of usernames) {
        await client.rPush('usernameQueue', username); // Add to Redis queue
    }
}

// Function to get an available username from Redis
async function getAvailableUsername() {
    return new Promise((resolve, reject) => {
        client.lPop('usernameQueue', (err, username) => {
            if (err) {
                reject(err);
            }
            resolve(username);
        });
    });
}

// Function to release a username back to Redis
async function releaseUsername(username) {
    return new Promise((resolve, reject) => {
        client.rPush('usernameQueue', username, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

// Login function for a single user
async function testLogin(page) {
    let username;
    let startTime = Date.now();
    const maxWaitTime = 30 * 1000; // 30 seconds in milliseconds

    // Wait until a username is available or max wait time is exceeded
    while (true) {
        username = await getAvailableUsername();
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
        await expect(page.getByRole('button', { name: 'New Document' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: 'New Document' }).click();

        // Select the last dropdown menu and click on 'Try Editor 3.0'
        let newDocumentDropdown = await page.locator('.MuiPaper-root').last();
        await expect(newDocumentDropdown).toBeVisible();
        await newDocumentDropdown.locator('[role="menuitem"]').getByText('Try Editor 3.0').click();

        // Wait for the modal to appear and click 'Start from scratch'
        let modalLocator = await page.locator('[role="dialog"]').filter({ hasText: 'Select a template' });
        await modalLocator.getByRole('button', { name: 'Start from scratch' }).click();

        // Click on the user avatar to open the user menu
        await expect(page.locator('[data-testid="avatar-button"]')).toBeVisible({ timeout: 15000 });
        await page.locator('[data-testid="avatar-button"]').click();
        let userDropdownMenu = await page.locator('[class*="ant-dropdown avatar-dropdown ant-dropdown-placement-bottomRight "]');
        await expect(userDropdownMenu).toBeVisible();

        // Logout by selecting 'Logout' from the dropdown menu
        await userDropdownMenu.locator('[role="menuitem"]').filter({ hasText: 'Logout' }).click();
    } catch (error) {
        console.error(`Test failed for ${username}:`, error);
        throw error;
    } finally {
        // Cleanup: Release the username back to the queue after the test finishes
        await releaseUsername(username);
        console.log(`Released ${username} back to the queue.`);
    }
}

// Initialize the Redis queue with usernames before running tests
initializeUsernameQueue().catch(err => console.error('Failed to initialize username queue:', err));

module.exports = {
    testLogin
};
