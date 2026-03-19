import { test, expect } from '@playwright/test';

test.describe('Privacy Policy Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/privacy');
  });

  test('should load the privacy policy page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Privacy Policy/i);
    await expect(page.locator('h1')).toContainText(/Privacy Policy/i);
  });

  test('should have a centered main container', async ({ page }) => {
    const container = page.locator('main').locator('.chakra-container');
    // Note: If using Chakra UI v3, the selector might be different, let's try to find it by role or a unique text
    const mainContent = page.locator('text=1. Introduction').locator('..').locator('..').locator('..'); // Find the card
    
    const box = await mainContent.boundingBox();
    const viewport = page.viewportSize();
    
    if (box && viewport) {
      const centerX = box.x + box.width / 2;
      const viewportCenterX = viewport.width / 2;
      
      // Allow for a small margin of error (e.g., 2px)
      expect(Math.abs(centerX - viewportCenterX)).toBeLessThan(5);
    }
  });

  test('should display navbar and footer', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have a functional "Back to Home" button', async ({ page }) => {
    const backButton = page.locator('text=Back to Home');
    await expect(backButton).toBeVisible();
    await backButton.click();
    await expect(page).toHaveURL('/');
  });
});
