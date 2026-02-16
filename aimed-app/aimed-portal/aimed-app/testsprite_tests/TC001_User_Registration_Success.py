import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)

        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass

        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:3000
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # -> Navigate to the registration page /registracija, wait for the page to load, and inspect interactive elements (form fields, submit button).
        await page.goto("http://localhost:3000/registracija", wait_until="commit", timeout=10000)
        
        # -> Fill the registration form fields (full name, specialization, clinic, email, password, password confirm) with valid values and then submit the form.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/form/div[1]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Dr. Test Registracija')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/form/div[2]/div[1]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Internista')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/form/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test Klinika')
        
        # -> Fill Email, Password and Password Confirmation fields, then submit the registration form (click 'Registrujte se').
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/form/div[4]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('testsprite-new@aimed-test.com')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/form/div[5]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('TestPass123!')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/form/div[6]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('TestPass123!')
        
        # -> Click the 'Registrujte se' submit button (index 102) to submit the registration form. After the page responds, verify whether a success or error message is shown and check for localStorage key 'aimed_settings'.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Confirmation email sent').first).to_be_visible(timeout=3000)
        except AssertionError:
            raise AssertionError("Test case failed: Expected the 'Confirmation email sent' message after submitting the registration form to verify that registration completed and a confirmation email was dispatched, but the message did not appear")
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    