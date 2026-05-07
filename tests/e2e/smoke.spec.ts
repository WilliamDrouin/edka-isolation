import { expect, test } from '@playwright/test';

test('la page d\'accueil charge et affiche le titre du site', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Isolation EDKA');
});

test('la page d\'accueil expose le bon lang HTML', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA');
});
