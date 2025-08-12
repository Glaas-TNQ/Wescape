import { test, expect } from '@playwright/test';

test.describe('Chat Basic Interaction', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to trip canvas page
    await page.goto('/trip/test-trip-id');
    
    // Wait for canvas to load
    await page.waitForSelector('[data-testid="trip-canvas"]', { timeout: 10000 });
  });

  test('should show chat toggle button', async ({ page }) => {
    // Chat toggle button should be visible
    await expect(page.locator('[data-testid="chat-toggle-button"]')).toBeVisible();
    
    // Should have correct aria-label
    await expect(page.locator('[data-testid="chat-toggle-button"]')).toHaveAttribute('aria-label', 'Apri chat con Mona');
  });

  test('should open and close chat sidebar with button click', async ({ page }) => {
    // Chat initially closed
    await expect(page.locator('[data-testid="chat-sidebar"]')).not.toBeVisible();
    
    // Click toggle button to open
    await page.locator('[data-testid="chat-toggle-button"]').click();
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible();
    
    // Button should update aria-label
    await expect(page.locator('[data-testid="chat-toggle-button"]')).toHaveAttribute('aria-label', 'Chiudi chat con Mona');
    
    // Click again to close
    await page.locator('[data-testid="chat-toggle-button"]').click();
    await expect(page.locator('[data-testid="chat-sidebar"]')).not.toBeVisible();
  });

  test('should open and close chat with keyboard shortcut Ctrl+M', async ({ page }) => {
    // Chat initially closed
    await expect(page.locator('[data-testid="chat-sidebar"]')).not.toBeVisible();
    
    // Press Ctrl+M to open
    await page.keyboard.press('Control+m');
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible();
    
    // Press Ctrl+M again to close
    await page.keyboard.press('Control+m');
    await expect(page.locator('[data-testid="chat-sidebar"]')).not.toBeVisible();
  });

  test('should close chat with Escape key', async ({ page }) => {
    // Open chat first
    await page.locator('[data-testid="chat-toggle-button"]').click();
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible();
    
    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="chat-sidebar"]')).not.toBeVisible();
  });

  test('should close chat with close button', async ({ page }) => {
    // Open chat
    await page.locator('[data-testid="chat-toggle-button"]').click();
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible();
    
    // Click close button in header
    await page.locator('[data-testid="chat-sidebar"] button[aria-label="Chiudi chat"]').click();
    await expect(page.locator('[data-testid="chat-sidebar"]')).not.toBeVisible();
  });

  test('should show welcome message when opening chat for first time', async ({ page }) => {
    // Open chat
    await page.locator('[data-testid="chat-toggle-button"]').click();
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible();
    
    // Should show welcome message
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Ciao! Sono Mona');
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('assistente AI per la pianificazione viaggi');
  });

  test('should show canvas context info in header', async ({ page }) => {
    // Add some sample nodes to canvas first
    await page.evaluate(() => {
      // Mock adding some nodes to canvas store
      window.canvasStore?.loadSampleData?.();
    });
    
    // Open chat
    await page.locator('[data-testid="chat-toggle-button"]').click();
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible();
    
    // Should show context info
    await expect(page.locator('[data-testid="chat-sidebar"]')).toContainText('Canvas attivo');
    await expect(page.locator('[data-testid="chat-sidebar"]')).toContainText('nodi');
  });

  test('should focus input when chat opens', async ({ page }) => {
    // Open chat
    await page.locator('[data-testid="chat-toggle-button"]').click();
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible();
    
    // Input should be focused
    await expect(page.locator('[data-testid="chat-input"]')).toBeFocused();
  });

  test('should show quick action buttons', async ({ page }) => {
    // Open chat
    await page.locator('[data-testid="chat-toggle-button"]').click();
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible();
    
    // Should show quick action buttons
    await expect(page.locator('[data-testid="quick-action-ristoranti"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-attività"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-hotel"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-trasporti"]')).toBeVisible();
  });

  test('should show optimize button when there are enough nodes', async ({ page }) => {
    // Add nodes to canvas
    await page.evaluate(() => {
      // Mock adding multiple nodes
      const store = window.canvasStore;
      if (store) {
        for (let i = 0; i < 5; i++) {
          store.addNode('destination', { x: 100 + i * 50, y: 100 });
        }
      }
    });
    
    // Open chat
    await page.locator('[data-testid="chat-toggle-button"]').click();
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible();
    
    // Should show optimize button
    await expect(page.locator('[data-testid="quick-action-ottimizza"]')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open chat
    await page.locator('[data-testid="chat-toggle-button"]').click();
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible();
    
    // Chat should adapt to mobile (take more width)
    const chatSidebar = page.locator('[data-testid="chat-sidebar"]');
    const boundingBox = await chatSidebar.boundingBox();
    
    // Should take most of the viewport width on mobile
    expect(boundingBox?.width).toBeGreaterThan(300);
  });

  test('should show overlay on mobile when chat is open', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open chat
    await page.locator('[data-testid="chat-toggle-button"]').click();
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible();
    
    // Should show overlay
    await expect(page.locator('.fixed.inset-0.bg-black\\/20')).toBeVisible();
  });
});