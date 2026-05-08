import { expect, test } from '@playwright/test';

test.describe('Formulaire de contact', () => {
  test('affiche des erreurs sur les champs requis quand on soumet vide', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('#form-submit').click();

    await expect(page.locator('[data-error-for="nom"]')).toBeVisible();
    await expect(page.locator('[data-error-for="courriel"]')).toBeVisible();
    await expect(page.locator('[data-error-for="message"]')).toBeVisible();

    await expect(page.locator('#form-success')).toBeHidden();
  });

  test('refuse un courriel mal formé', async ({ page }) => {
    await page.goto('/contact');
    await page.fill('#nom', 'Jean Tremblay');
    await page.fill('#courriel', 'pas-un-courriel');
    await page.selectOption('#typeProjet', 'residentiel');
    await page.fill('#message', 'Bonjour, j\'aimerais une soumission pour mes combles.');

    await page.locator('#form-submit').click();

    await expect(page.locator('[data-error-for="courriel"]')).toBeVisible();
    await expect(page.locator('#form-success')).toBeHidden();
  });

  test('soumet correctement et montre le panel de succès (mode démo)', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, demoMode: true }),
      });
    });

    await page.goto('/contact');
    await page.fill('#nom', 'Marie Dubé');
    await page.fill('#courriel', 'marie@example.com');
    await page.fill('#telephone', '418 555-1234');
    await page.selectOption('#typeProjet', 'residentiel');
    await page.fill('#typeBatiment', 'Maison de 1980, sous-sol non isolé');
    await page.fill(
      '#message',
      'Bonjour, j\'aimerais une soumission pour isoler mon sous-sol. Merci !',
    );

    await page.locator('#form-submit').click();

    await expect(page.locator('#form-success')).toBeVisible();
    await expect(page.locator('#form-success-demo')).toBeVisible();
    await expect(page.locator('#contact-form')).toBeHidden();
  });

  test('le bouton "Envoyer une autre demande" réinitialise le formulaire', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, demoMode: true }),
      });
    });

    await page.goto('/contact');
    await page.fill('#nom', 'Marie Dubé');
    await page.fill('#courriel', 'marie@example.com');
    await page.selectOption('#typeProjet', 'residentiel');
    await page.fill('#message', 'Bonjour, j\'aimerais une soumission. Merci !');
    await page.locator('#form-submit').click();
    await expect(page.locator('#form-success')).toBeVisible();

    await page.locator('#form-reset').click();
    await expect(page.locator('#contact-form')).toBeVisible();
    await expect(page.locator('#nom')).toHaveValue('');
  });

  test('le honeypot rejette silencieusement les bots', async ({ page }) => {
    let interceptedBody: unknown = null;
    await page.route('**/api/contact', async (route) => {
      interceptedBody = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, demoMode: true }),
      });
    });

    await page.goto('/contact');
    await page.fill('#nom', 'Bot Suspect');
    await page.fill('#courriel', 'bot@example.com');
    await page.selectOption('#typeProjet', 'residentiel');
    await page.fill('#message', 'Message rempli par un bot probablement.');
    await page.locator('#siteWeb').evaluate((el: HTMLInputElement) => {
      el.value = 'https://spam.example.com';
    });

    await page.locator('#form-submit').click();
    await expect(page.locator('#form-success')).toBeVisible();
    expect(interceptedBody).toMatchObject({ siteWeb: 'https://spam.example.com' });
  });
});
