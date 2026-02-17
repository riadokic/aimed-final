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
        
        # -> Click the 'Registracija' link in the page header to open the registration page (navigate to /registracija).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=html/body/div[2]/div[2]/nav/div/div[2]/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click the 'Registracija' link in the header again (index 101) to open the registration page (/registracija).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=html/body/div[2]/div[2]/nav/div/div[2]/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Fill the registration form with an invalid email (not-an-email), check the GDPR checkbox, submit the form, then look for the text 'email' on the page indicating validation error.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/form/div[1]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Dr Invalid Email')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/form/div[4]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('not-an-email')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/form/div[5]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('ValidPassw0rd!')
        
        # -> Type the confirm password, check the GDPR checkbox, submit the form, then check the page for the text 'email' indicating a validation error (and confirm the URL still contains '/registracija').
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/form/div[6]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('ValidPassw0rd!')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/form/label/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        await page.wait_for_timeout(1000)
        # Verify the Email label / validation text is visible
        assert await frame.locator("text=Email").is_visible(), 'Expected "Email" text to be visible on the page'
        # Verify the URL still contains /registracija (registration blocked)
        assert "/registracija" in frame.url, f'Expected URL to contain "/registracija", actual: {frame.url}'
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    