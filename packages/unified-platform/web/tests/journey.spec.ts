import { test, expect } from '@playwright/test';

test.describe('Platform User Journeys', () => {

  test('Trace and Session Replay Journey', async ({ page }) => {
    await page.goto('/');
    
    // Should default to traces view
    await expect(page.getByRole('heading', { name: 'Traces' })).toBeVisible();

    // The backend might not have real data, so we check for either data or empty state
    const tableVisible = await page.isVisible('table');
    if (tableVisible) {
      await page.locator('table tbody tr').first().click();
      await expect(page.getByText('Trace Details')).toBeVisible();
    }
    
    // Navigate to Replays
    await page.click('text=Session Replays');
    await expect(page.getByRole('heading', { name: 'Session Replays' })).toBeVisible();
  });

  test('Pipeline Builder Journey', async ({ page }) => {
    await page.goto('/pipelines');
    
    // Go to builder
    await page.click('text=Build Pipeline');
    
    // Check canvas exists
    await expect(page.locator('.react-flow')).toBeVisible();
    
    // Interact with node catalog
    await page.click('text=OTLP Receiver');
    await expect(page.locator('.react-flow__node').filter({ hasText: 'OTLP Receiver' })).toBeVisible();
  });

  test('Chaos Engineering Journey', async ({ page }) => {
    await page.goto('/chaos');
    
    // Create new experiment
    await page.click('text=Create Experiment');
    await expect(page.getByRole('heading', { name: 'Create Chaos Experiment' })).toBeVisible();
    
    // Fill form
    await page.fill('input[type="text"]', 'Test E2E Experiment');
    await page.click('text=Latency Injection');
    
    // We do not submit to avoid cluttering local backend during simple dev runs, 
    // but the form is fully accessible
    await page.click('text=Cancel');
    await expect(page.getByRole('heading', { name: 'Chaos Engineering' })).toBeVisible();
  });
});
