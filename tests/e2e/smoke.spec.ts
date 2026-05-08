import { expect, test } from '@playwright/test';

test('la page d\'accueil charge et affiche le titre principal', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Isolation qui tient tête à l\'hiver');
});

test('la langue HTML est fr-CA', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA');
});

test('le schema LocalBusiness est présent', async ({ page }) => {
  await page.goto('/');
  const ldJson = await page.locator('script[type="application/ld+json"]').textContent();
  expect(ldJson).toContain('"@type":"LocalBusiness"');
  expect(ldJson).toContain('Isolation EDKA');
  expect(ldJson).toContain('Saint-Georges-de-Beauce');
});
