import { expect, test } from '@playwright/test';

const pages = [
  { path: '/', titleContains: 'Isolation qui tient tête' },
  { path: '/services', titleContains: 'Toutes les techniques' },
  { path: '/subventions', titleContains: 'Vos travaux peuvent être' },
  { path: '/realisations', titleContains: 'On laisse les chantiers parler' },
  { path: '/a-propos', titleContains: 'L\'isolation, c\'est notre métier' },
  { path: '/contact', titleContains: 'Demandez votre soumission' },
] as const;

test.describe('Navigation entre les 6 pages principales', () => {
  for (const { path, titleContains } of pages) {
    test(`la page ${path} charge correctement`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toContainText(titleContains);
    });
  }
});

test('la nav du header pointe vers les bonnes pages', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) {
    await page.locator('#mobile-menu-toggle').click();
  }
  const navLinks = page.locator('header nav a');
  await expect(navLinks).toHaveText([
    'Accueil',
    'Services',
    'Subventions',
    'Réalisations',
    'À propos',
    'Contact',
  ]);
});

test('le filtre des réalisations cache et révèle les cards', async ({ page }) => {
  await page.goto('/realisations');
  const allCards = page.locator('#realisations-grid > li');
  const totalCount = await allCards.count();
  expect(totalCount).toBeGreaterThan(0);

  await page.locator('button[data-filter="residentiel"]').click();
  const visibleCards = page.locator('#realisations-grid > li:not([hidden])');
  const visibleCount = await visibleCards.count();
  expect(visibleCount).toBeLessThan(totalCount);
  expect(visibleCount).toBeGreaterThan(0);

  await page.locator('button[data-filter="all"]').click();
  await expect(page.locator('#realisations-grid > li:not([hidden])')).toHaveCount(totalCount);
});

test('une réalisation a sa page détail avec breadcrumb', async ({ page }) => {
  await page.goto('/realisations/chalet-renove-beauce');
  await expect(page.locator('h1')).toContainText('Chalet rénové en Beauce');
  await expect(page.locator('nav[aria-label="Fil d\'Ariane"]')).toContainText('Réalisations');
});
