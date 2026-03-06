import { test, expect } from '@playwright/test';

test.describe('Work Order Timeline E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Because we set the baseURL in the config, '/' goes to localhost:4200
    await page.goto('/');
  });

  test('should load the timeline and display work orders', async ({ page }) => {
    // Look for the elements with the class 'task-bar'
    const taskBars = page.locator('.task-bar');
    
    // Assert that at least the first one actually renders on the screen
    await expect(taskBars.first()).toBeVisible();
  });

});