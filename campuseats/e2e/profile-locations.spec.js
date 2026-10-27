import { test, expect } from "@playwright/test";

const unique = Date.now();

async function registerCustomer(page, name, email) {
  await page.goto("/register");
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Phone number").fill("+8801712345678");
  await page.getByLabel("Password", { exact: true }).fill("CampusEats123!");
  await page.getByLabel("Confirm password").fill("CampusEats123!");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create customer account" }).click();
  await page.waitForURL(/\/verify-otp/);
  for (let i = 0; i < 6; i += 1) {
    await page.getByLabel(`Digit ${i + 1} of 6`).fill("123456"[i]);
  }
  await page.getByRole("button", { name: "Verify & continue" }).click();
  await page.waitForURL(/\/customer/);
}

async function logout(page) {
  await page.locator(".dropdown").click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await page.waitForURL(/\/login/);
}

async function addFoodAndOpenCheckout(page) {
  await page.goto("/customer/restaurant/1");
  const add = page.locator("button.food-card__add:not([disabled])");
  await expect(add.first()).toBeVisible();
  await add.first().click();
  await page.getByRole("link", { name: "Cart", exact: true }).click();
  await page.getByRole("button", { name: /Proceed to Checkout/ }).click();
}

test("new customer profile changes persist through reload and a fresh login", async ({ page }) => {
  const name = `Profile Customer ${unique}`;
  const email = `profile.${unique}@e2e.test`;
  await registerCustomer(page, name, email);
  const header = page.locator("header.customer-header");
  await expect(header.getByText(name)).toBeVisible();

  await page.goto("/customer/profile");
  await page.getByLabel("Full name").fill(`${name} Updated`);
  await page.getByLabel("Phone number").fill("+8801812345678");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(header.getByText(`${name} Updated`)).toBeVisible();
  await expect(page.getByText("Profile updated")).toBeVisible();

  await page.reload();
  await expect(header.getByText(`${name} Updated`)).toBeVisible();
  await expect(page.getByLabel("Phone number")).toHaveValue("+8801812345678");
  await logout(page);

  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("CampusEats123!");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/customer/);
  await expect(page.locator("header.customer-header").getByText(`${name} Updated`)).toBeVisible();
  await page.goto("/customer/profile");
  await expect(page.getByLabel("Phone number")).toHaveValue("+8801812345678");
});

test("saved address is selected in the header and reused for checkout", async ({ page }) => {
  const name = `Address Customer ${unique}`;
  await registerCustomer(page, name, `address.${unique}@e2e.test`);
  await page.goto("/customer/locations");
  await page.getByRole("button", { name: "Add a new address" }).click();
  await page.getByLabel("Address line").fill(`E2E Hall ${unique}, Room 12`);
  await page.getByLabel("Area").fill("North Campus");
  await page.getByLabel("City").fill("Campus Town");
  await page.getByRole("button", { name: "Save address" }).click();

  const addressLine = `E2E Hall ${unique}, Room 12`;
  await expect(page.locator("header.customer-header")).toContainText(addressLine);
  await addFoodAndOpenCheckout(page);
  await expect(page.locator(".checkout-summary")).toContainText(addressLine);
  await page.getByRole("button", { name: /Place Order/ }).click();
  await page.waitForURL(/\/customer\/order-success/);
  await expect(page.locator(".order-success__card")).toContainText(addressLine);
});

test("guest sees a login prompt for saved locations", async ({ page }) => {
  await page.goto("/customer/locations");
  await expect(page.locator("#main-content").getByText("Log in to save delivery addresses")).toBeVisible();
  await expect(page.locator("#main-content").getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
});

test("saved addresses can be edited, removed, and marked as default", async ({ page }) => {
  const name = `Address Manager ${unique}`;
  await registerCustomer(page, name, `address-manager.${unique}@e2e.test`);
  await page.goto("/customer/locations");

  await page.getByRole("button", { name: "Add a new address" }).click();
  await page.getByLabel("Address line").fill(`First Hall ${unique}`);
  await page.getByLabel("Area").fill("North Campus");
  await page.getByLabel("City").fill("Campus Town");
  await page.getByRole("button", { name: "Save address" }).click();
  await page.getByRole("button", { name: "Add a new address" }).click();
  await page.getByLabel("Address line").fill(`Second Hall ${unique}`);
  await page.getByLabel("Area").fill("South Campus");
  await page.getByLabel("City").fill("Campus Town");
  await page.getByRole("button", { name: "Save address" }).click();

  const firstCard = page.locator(".address-card").filter({ hasText: `First Hall ${unique}` });
  const secondCard = page.locator(".address-card").filter({ hasText: `Second Hall ${unique}` });
  await secondCard.getByRole("button", { name: "Set default" }).click();
  await expect(secondCard.getByText("Default", { exact: true })).toBeVisible();

  await firstCard.getByRole("button", { name: "Edit address" }).click();
  await page.getByLabel("Address line").fill(`Updated Hall ${unique}`);
  await page.getByRole("button", { name: "Save address" }).click();
  const updatedCard = page.locator(".address-card").filter({ hasText: `Updated Hall ${unique}` });
  await expect(updatedCard).toBeVisible();
  await updatedCard.getByRole("button", { name: "Delete address" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete Address" }).click();
  await expect(updatedCard).toHaveCount(0);
});
