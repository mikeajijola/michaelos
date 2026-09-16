import { expect, test, type Page } from "@playwright/test";

const capabilityId = "system.getCapabilityConformance";
const actionKeys = "SYSTEM CAPABILITY CONFORMANCE ENTER";

async function openCapabilities(page: Page) {
  await page.goto("/capabilities");
  await expect(page.getByRole("heading", { name: "Capability explorer" })).toBeVisible();
}

async function assertConformanceStatus(page: Page) {
  const status = page.getByRole("status").filter({ hasText: "Current conformance" });
  await expect(status).toBeVisible();
  await expect(status).toContainText(/current|stale|indeterminate/);
  await expect(status).toContainText(/revision/);
  await expect(status).toContainText(/manifest/);
  return status;
}

test("capability page and Inspector expose one accessible conformance projection", async ({ page }, testInfo) => {
  await openCapabilities(page);
  await page.getByRole("button", { name: "View capability conformance" }).click();
  const status = await assertConformanceStatus(page);

  await page.getByRole("button", { name: "Open Agent CLI", exact: true }).click();
  await page.getByRole("button", { name: "Inspector", exact: true }).click();
  const inspector = page.getByLabel("Agent Console").getByText(capabilityId, { exact: true });
  await expect(inspector).toBeVisible();
  await expect(page.getByLabel("Agent Console").getByText("Execution status")).toBeVisible();
  await expect(page.getByLabel("Agent Console").getByText("Effect status")).toBeVisible();

  await status.screenshot({ path: testInfo.outputPath("capability-conformance.png") });
});

test("keyboard-only Action Keys execution reaches shared history and Inspector", async ({ page }) => {
  await openCapabilities(page);

  await page.keyboard.press(process.platform === "darwin" ? "Meta+Alt+KeyK" : "Control+Alt+KeyK");
  const dialog = page.getByRole("dialog", { name: "Action Key Mode" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Action Key")).toBeFocused();
  await page.keyboard.type(actionKeys);
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: "Open Agent CLI", exact: true }).click();
  await page.getByRole("button", { name: "History", exact: true }).click();
  const historyEntry = page.getByRole("button").filter({ hasText: capabilityId }).first();
  await expect(historyEntry).toContainText("hotkey");
  await historyEntry.press("Enter");
  await page.getByRole("button", { name: "Inspector", exact: true }).click();
  await expect(page.getByLabel("Agent Console")).toContainText(actionKeys);
  await expect(page.getByLabel("Agent Console")).toContainText("Get current capability conformance");
});

test("Agent CLI publishes the machine envelope and shared execution identity", async ({ page }) => {
  await openCapabilities(page);
  await page.getByRole("button", { name: "Open Agent CLI" }).click();
  const terminal = page.getByLabel("MikeOS Agent CLI");
  await expect(terminal).toBeVisible();
  await terminal.click();
  await page.keyboard.type(`run ${capabilityId} --json`);
  await page.keyboard.press("Enter");

  await expect(terminal).toContainText('"freshness"');
  await expect(terminal).toContainText('"digest"');
  await page.getByRole("button", { name: "Inspector", exact: true }).click();
  await expect(page.getByLabel("Agent Console")).toContainText("terminal");
  await expect(page.getByLabel("Agent Console")).toContainText(capabilityId);
});

test("Navi projects the same revision, digest and freshness", async ({ page }) => {
  await openCapabilities(page);
  await page.getByRole("button", { name: "View capability conformance" }).click();
  const statusText = await (await assertConformanceStatus(page)).innerText();
  const revision = statusText.match(/revision\s+([^\s]+)/)?.[1];
  const digest = statusText.match(/manifest\s+([^\s]+)/)?.[1];
  expect(revision).toBeTruthy();
  expect(digest).toBeTruthy();

  await page.getByRole("button", { name: "Open Navi" }).click();
  const navi = page.getByLabel("Navi Panel");
  await navi.getByLabel("Ask Navi to navigate MikeOS").fill("Show capability conformance");
  await navi.getByRole("button", { name: "Send request to Navi" }).click();
  const answer = navi.locator(".lily-message.lily").last();
  await expect(answer).toContainText(revision!);
  await expect(answer).toContainText(digest!);
  await expect(answer).toContainText(/current|stale|indeterminate/);
});

test("responsive and reduced-motion modes retain operable, named controls", async ({ page }) => {
  await openCapabilities(page);
  await expect(page.getByRole("button", { name: "View capability conformance" })).toBeInViewport();
  await page.getByRole("button", { name: "View capability conformance" }).focus();
  await expect(page.getByRole("button", { name: "View capability conformance" })).toBeFocused();
  await page.keyboard.press("Enter");
  await assertConformanceStatus(page);

  const reduced = await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (test.info().project.name === "reduced-motion") expect(reduced).toBe(true);
});
