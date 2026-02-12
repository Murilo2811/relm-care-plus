import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test('Submit Warranty Claim', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(60000);

    console.log('Navigating to localhost:5173...');
    try {
        await page.goto('http://localhost:3000', { timeout: 15000 });
    } catch (e) {
        console.error('Navigation failed:', e);
        // Take screenshot if navigation fails/times out
        await page.screenshot({ path: 'tests/nav_failure.png' });
        throw e;
    }

    // Debug: Print page title and content to verify we are on the right page
    console.log('Page Title:', await page.title());

    // Wait for the form or a key element to be visible
    console.log('Waiting for form elements...');
    try {
        // Trying to wait for "Nome Completo" label
        await expect(page.getByLabel('Nome Completo')).toBeVisible({ timeout: 10000 });
    } catch (e) {
        console.error('Form element not found. Taking screenshot.');
        await page.screenshot({ path: 'tests/form_not_found.png' });
        console.log('Page content length:', (await page.content()).length);
        throw e;
    }

    console.log('Filling form...');
    await page.getByLabel('Nome Completo').fill('Usuário Browser Real');
    await page.getByLabel('Email').fill('browser@teste.com');
    await page.getByLabel('Telefone').fill('11999998888');

    // Select Item Type
    // Trying a more generic selector if label fails or using selectOption if it's a select
    // Check if it's a select or input
    const typeInput = page.getByLabel('Tipo de Item');
    try {
        await typeInput.selectOption({ label: 'Bicicleta' });
    } catch {
        await typeInput.fill('Bicicleta');
    }

    await page.getByLabel('Descrição do Produto').fill('Bicicleta de Teste Automatizado');
    await page.getByLabel('Número de Série').fill('BROWSER-AUTO-123');

    console.log('Submitting...');
    await page.getByRole('button', { name: 'Solicitar Garantia' }).click();

    console.log('Waiting for success message...');
    // 4. Verify Success and Capture Protocol
    const successMessage = page.getByText('Solicitação enviada com sucesso');
    await expect(successMessage).toBeVisible({ timeout: 15000 });

    // Extract Protocol Number
    const protocolElement = page.locator('text=/HB-\\d{8}-\\d{4}/');
    await expect(protocolElement).toBeVisible();

    const protocolText = await protocolElement.innerText();
    console.log(`CAPTURED_PROTOCOL: ${protocolText}`);
});
