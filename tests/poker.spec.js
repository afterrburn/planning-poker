const { test, expect } = require('@playwright/test');

test.describe('Planning Poker', () => {
  test('should show join form on load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Planning Poker');
    await expect(page.locator('#userName')).toBeVisible();
    await expect(page.locator('#roomId')).toBeVisible();
  });

  test('should join a room and see voting cards', async ({ page }) => {
    await page.goto('/');
    await page.fill('#userName', 'Seng');
    await page.fill('#roomId', 'test-room');
    await page.click('button:has-text("Join Room")');

    // Should show game room
    await expect(page.locator('#gameRoom')).toHaveClass(/active/);

    // Should have fibonacci cards
    await expect(page.locator('.card')).toHaveCount(10);
    await expect(page.locator('.card').first()).toHaveText('0');
  });

  test('should allow voting', async ({ page }) => {
    await page.goto('/');
    await page.fill('#userName', 'Seng');
    await page.fill('#roomId', 'vote-test');
    await page.click('button:has-text("Join Room")');

    // Click on card "5"
    await page.locator('.card:has-text("5")').click();

    // Card should be selected
    await expect(page.locator('.card:has-text("5")')).toHaveClass(/selected/);

    // Participant card should show voted
    await expect(page.locator('.participant-card').first()).toHaveClass(/voted/);
  });

  test('should reveal votes', async ({ page }) => {
    await page.goto('/');
    await page.fill('#userName', 'Seng');
    await page.fill('#roomId', 'reveal-test');
    await page.click('button:has-text("Join Room")');

    // Vote
    await page.locator('.card:has-text("8")').click();

    // Reveal
    await page.click('button:has-text("Reveal Votes")');

    // Participant card should show the vote
    await expect(page.locator('.participant-card').first()).toHaveText('8');
    await expect(page.locator('.participant-card').first()).toHaveClass(/revealed/);

    // Results should show
    await expect(page.locator('#results')).toHaveClass(/show/);
  });

  test('should reset for new round', async ({ page }) => {
    await page.goto('/');
    await page.fill('#userName', 'Seng');
    await page.fill('#roomId', 'reset-test');
    await page.click('button:has-text("Join Room")');

    // Vote and reveal
    await page.locator('.card:has-text("3")').click();
    await page.click('button:has-text("Reveal Votes")');

    // Reset
    await page.click('button:has-text("New Round")');

    // Cards should not be selected
    await expect(page.locator('.card.selected')).toHaveCount(0);

    // Participant should show "?"
    await expect(page.locator('.participant-card').first()).toHaveText('?');
  });

  test('two users can join same room', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // User 1 joins
    await page1.goto('/');
    await page1.fill('#userName', 'Seng');
    await page1.fill('#roomId', 'multi-user-test');
    await page1.click('button:has-text("Join Room")');

    // User 2 joins same room
    await page2.goto('/?room=multi-user-test');
    await page2.fill('#userName', 'Alex');
    await page2.click('button:has-text("Join Room")');

    // Both should see 2 participants
    await expect(page1.locator('.participant')).toHaveCount(2);
    await expect(page2.locator('.participant')).toHaveCount(2);

    // User 1 votes
    await page1.locator('.card:has-text("5")').click();

    // User 2 should see User 1 has voted
    await expect(page2.locator('.participant-card.voted')).toHaveCount(1);

    // User 2 votes
    await page2.locator('.card:has-text("8")').click();

    // Both should show voted
    await expect(page1.locator('.participant-card.voted')).toHaveCount(2);

    // Reveal
    await page1.click('button:has-text("Reveal Votes")');

    // Both should see revealed votes
    await expect(page1.locator('.participant-card.revealed')).toHaveCount(2);
    await expect(page2.locator('.participant-card.revealed')).toHaveCount(2);

    await context1.close();
    await context2.close();
  });
});
