import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test('Submit Warranty Claim', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(60000);

    // Navigate to /#/register for HashRouter
    const BASE_URL = process.env.BASE_URL || 'https://relm-care.vercel.app';
    const targetUrl = BASE_URL.endsWith('/') ? `${BASE_URL}#/register` : `${BASE_URL}/#/register`;

    console.log(`Navigating to ${targetUrl}...`);
    try {
        await page.goto(targetUrl, { timeout: 15000 });
    } catch (e) {
        console.error('Navigation failed:', e);
        await page.screenshot({ path: 'tests/nav_failure.png' });
        throw e;
    }

    console.log('Page Title:', await page.title());

    // Step 1: Personal Data
    console.log('Filling Step 1...');
    await expect(page.locator('input[name="customerName"]')).toBeVisible({ timeout: 10000 });
    await page.locator('input[name="customerName"]').fill('Usuário Browser Real');
    await page.locator('input[name="customerPhone"]').fill('11999998888');
    await page.locator('input[name="customerEmail"]').fill('browser@teste.com');

    console.log('Going to Step 2...');
    await page.getByRole('button', { name: 'Próximo Passo' }).click();

    // Step 2: Product Data
    console.log('Filling Step 2...');
    await expect(page.locator('input[name="productDescription"]')).toBeVisible();
    await page.locator('input[name="productDescription"]').fill('Relm Speedster 300');
    await page.locator('input[name="serialNumber"]').fill('TEST-PROD-REAL-001');
    await page.locator('input[name="invoiceNumber"]').fill('NF-123456');
    await page.locator('input[name="purchaseStoreName"]').fill('Loja Exemplo SP');
    await page.locator('input[name="purchaseStoreCity"]').fill('São Paulo');
    await page.locator('input[name="purchaseDate"]').fill('2024-01-15');

    // Policy Checkbox
    console.log('Accepting policy...');
    // Checkbox has id="policy" and label htmlFor="policy", so getByLabel works with regex
    await page.getByLabel(/Li e concordo/).check();

    // Submit
    console.log('Submitting...');
    await page.getByRole('button', { name: 'Registrar Garantia' }).click();

    console.log('Waiting for success message...');
    const successMessage = page.getByText('Solicitação Recebida!');
    await expect(successMessage).toBeVisible({ timeout: 20000 });

    // Extract Protocol
    const protocolElement = page.locator('p.text-2xl.font-mono');
    await expect(protocolElement).toBeVisible();

    const protocolText = await protocolElement.innerText();
    console.log(`CAPTURED_PROTOCOL: ${protocolText}`);
});
