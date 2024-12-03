const { test, expect } = require('@playwright/test');
import { testLogin } from './commands/login';


test('Question 1: Load Test', async ({ page }) => {
  await testLogin(page)
});

