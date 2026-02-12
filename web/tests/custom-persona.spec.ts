import { test, expect } from '@playwright/test';

test.describe('Custom Persona Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/practice');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display custom persona input field', async ({ page }) => {
    await page.goto('/practice');

    // Find the custom persona input
    const personaInput = page.getByPlaceholder('e.g., a curious teenager');
    await expect(personaInput).toBeVisible();

    // Check the section heading
    await expect(page.getByRole('heading', { name: /Audience.*Persona/i })).toBeVisible();
  });

  test('should allow entering a custom persona', async ({ page }) => {
    await page.goto('/practice');

    const personaInput = page.getByPlaceholder('e.g., a curious teenager');
    const customPersona = 'a grandmother learning technology';

    await personaInput.fill(customPersona);

    // Verify input value
    await expect(personaInput).toHaveValue(customPersona);

    // Check for confirmation message
    await expect(page.getByText(/Will use:/i)).toBeVisible();
    await expect(page.getByText(customPersona)).toBeVisible();
  });

  test('should sanitize invalid characters', async ({ page }) => {
    await page.goto('/practice');

    const personaInput = page.getByPlaceholder('e.g., a curious teenager');
    const invalidPersona = 'a hacker <script>alert("xss")</script>';

    await personaInput.fill(invalidPersona);

    // Should show warning about filtered characters
    await expect(page.getByText(/Some characters were filtered/i)).toBeVisible();

    // Sanitized version should be shown
    const sanitizedText = page.getByText(/Will use:/i).locator('..');
    await expect(sanitizedText).toContainText('a hacker scriptalertxssscript');
  });

  test('should enforce max length of 50 characters', async ({ page }) => {
    await page.goto('/practice');

    const personaInput = page.getByPlaceholder('e.g., a curious teenager');
    const longPersona = 'a' + ' very'.repeat(20) + ' long persona description'; // > 50 chars

    await personaInput.fill(longPersona);

    // Input should be truncated to 50 characters
    const value = await personaInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(50);
  });

  test('should persist custom persona in localStorage', async ({ page }) => {
    await page.goto('/practice');

    const customPersona = 'a university student';
    const personaInput = page.getByPlaceholder('e.g., a curious teenager');

    await personaInput.fill(customPersona);

    // Check localStorage
    const storedPersona = await page.evaluate(() =>
      localStorage.getItem('thinkfast_custom_persona')
    );

    expect(storedPersona).toBe(customPersona);
  });

  test('should load custom persona from localStorage on page load', async ({ page }) => {
    // Set persona in localStorage before navigating
    await page.goto('/practice');
    const customPersona = 'a software engineer';

    await page.evaluate((persona) => {
      localStorage.setItem('thinkfast_custom_persona', persona);
    }, customPersona);

    // Reload the page
    await page.reload();

    // Check if persona is loaded
    const personaInput = page.getByPlaceholder('e.g., a curious teenager');
    await expect(personaInput).toHaveValue(customPersona);
  });

  test('should persist custom persona across page navigation', async ({ page }) => {
    await page.goto('/practice');

    const customPersona = 'a high school teacher';
    const personaInput = page.getByPlaceholder('e.g., a curious teenager');

    await personaInput.fill(customPersona);

    // Navigate to history page
    await page.click('a[href="/history"]');
    await expect(page).toHaveURL('/history');

    // Navigate back to practice
    await page.click('a[href="/practice"]');
    await expect(page).toHaveURL('/practice');

    // Persona should still be there
    const personaInputAfterNav = page.getByPlaceholder('e.g., a curious teenager');
    await expect(personaInputAfterNav).toHaveValue(customPersona);
  });

  test('should clear persona when input is emptied', async ({ page }) => {
    await page.goto('/practice');

    const personaInput = page.getByPlaceholder('e.g., a curious teenager');

    // Set a persona
    await personaInput.fill('a doctor');
    await expect(personaInput).toHaveValue('a doctor');

    // Clear it
    await personaInput.clear();

    // Should be empty in localStorage
    const storedPersona = await page.evaluate(() =>
      localStorage.getItem('thinkfast_custom_persona')
    );

    expect(storedPersona).toBeNull();
  });

  test('should use custom persona when generating prompt', async ({ page }) => {
    await page.goto('/practice');

    // Select a topic first
    const topicButton = page.getByRole('button', { name: /JavaScript/i }).first();
    await topicButton.click();

    // Set custom persona
    const customPersona = 'a marketing professional';
    const personaInput = page.getByPlaceholder('e.g., a curious teenager');
    await personaInput.fill(customPersona);

    // Generate prompt
    await page.click('text=Generate Prompt');

    // Wait for prompt to be generated (it appears as a heading after generation)
    await page.waitForSelector('h2', { timeout: 5000 });

    // The prompt should mention the custom persona
    const promptText = await page.locator('h2').textContent();
    expect(promptText?.toLowerCase()).toContain('marketing professional');
  });

  test('should handle special characters appropriately', async ({ page }) => {
    await page.goto('/practice');

    const personaInput = page.getByPlaceholder('e.g., a curious teenager');

    // Test allowed characters: letters, numbers, spaces, hyphens, commas, periods, apostrophes
    const validPersona = "a 5-year-old child, Sam's friend";
    await personaInput.fill(validPersona);

    // Should not show warning
    await expect(page.getByText(/Some characters were filtered/i)).not.toBeVisible();

    // Should show confirmation
    await expect(page.getByText(/Will use:/i)).toBeVisible();
  });

  test('should work with default personas when custom is empty', async ({ page }) => {
    await page.goto('/practice');

    // Select a topic
    const topicButton = page.getByRole('button', { name: /Python/i }).first();
    await topicButton.click();

    // Don't set custom persona (leave it empty)
    const personaInput = page.getByPlaceholder('e.g., a curious teenager');
    await expect(personaInput).toHaveValue('');

    // Generate prompt
    await page.click('text=Generate Prompt');

    // Wait for prompt (it appears as a heading after generation)
    await page.waitForSelector('h2', { timeout: 5000 });

    // Should use one of the default personas
    const promptText = await page.locator('h2').textContent();
    const defaultPersonas = ['child', 'teenager', 'non-technical', 'peer', 'executive', 'interviewer'];
    const hasDefaultPersona = defaultPersonas.some(persona =>
      promptText?.toLowerCase().includes(persona)
    );

    expect(hasDefaultPersona).toBe(true);
  });

  test('should send custom persona to scoring API', async ({ page }) => {
    await page.goto('/practice');

    // Select a topic
    const topicButton = page.getByRole('button', { name: /JavaScript/i }).first();
    await topicButton.click();

    // Set custom persona
    const customPersona = 'a small business owner';
    const personaInput = page.getByPlaceholder('e.g., a curious teenager');
    await personaInput.fill(customPersona);

    // Generate prompt
    await page.click('text=Generate Prompt');
    await page.waitForSelector('h2', { timeout: 5000 });

    // Start the timer
    await page.click('text=Start Timer');
    await page.waitForSelector('textarea', { timeout: 5000 });

    // Type some explanation
    const textarea = page.locator('textarea');
    await textarea.fill('This is a test explanation about JavaScript concepts.');

    // Listen for the scoring API request
    const apiRequestPromise = page.waitForRequest(request =>
      request.url().includes('/api/score') && request.method() === 'POST'
    );

    // Submit explanation
    await page.click('text=Submit');

    // Wait for the API request
    const apiRequest = await apiRequestPromise;
    const requestBody = apiRequest.postDataJSON();

    // Verify the request contains the custom persona in the audience field
    expect(requestBody.audience).toBeDefined();

    // The persona should be sanitized and included
    const expectedSanitized = customPersona.slice(0, 50).trim();
    expect(requestBody.audience.toLowerCase()).toContain('business');
    expect(requestBody.audience.toLowerCase()).toContain('owner');
  });

  test('should include custom persona in evaluation prompt sent to Claude', async ({ page }) => {
    await page.goto('/practice');

    // Intercept the API response to check what was sent
    let scoringPrompt = '';

    await page.route('**/api/score', async (route) => {
      const request = route.request();
      const requestData = request.postDataJSON();

      // The API constructs a prompt internally - we're verifying the input data
      // that will be used to build the prompt with the custom persona
      scoringPrompt = JSON.stringify(requestData);

      // Mock a successful response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          result: {
            clarity: { score: 8, feedback: 'Test feedback' },
            accuracy: { score: 8, feedback: 'Test feedback' },
            structure: { score: 7, feedback: 'Test feedback' },
            completeness: { score: 7, feedback: 'Test feedback' },
            conciseness: { score: 8, feedback: 'Test feedback' },
            overall: {
              score: 8,
              grade: 'B+',
              summary: 'Good explanation',
              strengths: ['Clear', 'Accurate'],
              improvements: ['Add examples', 'More detail']
            },
            modelExplanation: 'This is a model explanation.'
          }
        })
      });
    });

    // Select topic and set custom persona
    await page.getByRole('button', { name: /Python/i }).first().click();
    const customPersona = 'a retired engineer';
    await page.getByPlaceholder('e.g., a curious teenager').fill(customPersona);

    // Generate and start timer
    await page.click('text=Generate Prompt');
    await page.waitForSelector('h2', { timeout: 5000 });
    await page.click('text=Start Timer');
    await page.waitForSelector('textarea', { timeout: 5000 });
    await page.locator('textarea').fill('Python is a programming language.');

    // Submit
    await page.click('text=Submit');

    // Wait for the route to be called
    await page.waitForTimeout(1000);

    // Verify the scoring prompt data includes our custom persona
    expect(scoringPrompt).toBeTruthy();
    expect(scoringPrompt.toLowerCase()).toContain('retired');
    expect(scoringPrompt.toLowerCase()).toContain('engineer');
  });
});
