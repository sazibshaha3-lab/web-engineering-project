import { test, expect } from "@playwright/test";

const API = process.env.E2E_API_URL || "http://127.0.0.1:8000/api";
const testContexts = new Set();

const ACCOUNTS = {
  customer: { email: "demo@campuseats.test", password: "Demo123!", home: /\/customer/ },
  restaurant: { email: "restaurant@campuseats.test", password: "Restaurant123!", home: /\/restaurant/ },
  rider: { email: "rider@campuseats.test", password: "Rider123!", home: /\/rider/ },
  admin: { email: "admin@campuseats.test", password: "Admin123!", home: /\/admin/ },
};

// Each role gets its own browser context, so each has its own localStorage / session.
async function newTrackedContext(browser) {
  const context = await browser.newContext();
  testContexts.add(context);
  return context;
}

test.afterEach(async () => {
  const contexts = [...testContexts];
  testContexts.clear();
  await Promise.all(contexts.map((context) => context.close().catch(() => {})));
});

async function loginAs(browser, role) {
  const context = await newTrackedContext(browser);
  const page = await context.newPage();
  await page.goto("/login");
  // The login page has a one-click demo button per role; its text contains the account email.
  await page.getByRole("button", { name: new RegExp(ACCOUNTS[role].email) }).click();
  await page.waitForURL(ACCOUNTS[role].home);
  return { context, page };
}

// Customer: open Campus Grill House from the live catalog, add dishes, and place a COD order.
// Returns the order number (ORD-XXXXX) shown on the success page.
async function placeOrder(page) {
  await page.goto("/customer/restaurants");
  const restaurant = page.getByRole("link", { name: /Campus Grill House/ });
  await expect(restaurant).toBeVisible();
  await restaurant.click();
  const add = page.locator("button.food-card__add:not([disabled])");
  await expect(add.first()).toBeVisible();
  await add.first().click();
  await add.first().click();

  await page.getByRole("link", { name: "Cart", exact: true }).click();
  await page.getByRole("button", { name: /Proceed to Checkout/ }).click();
  const placeBtn = page.getByRole("button", { name: /Place Order/ });
  await expect(placeBtn).toBeEnabled(); // needs a selected delivery address (the seeded default one)
  await placeBtn.click();

  await page.waitForURL(/\/customer\/order-success/);
  const orderNo = (await page.locator(".order-success__order-id").innerText()).trim();
  expect(orderNo).toMatch(/^ORD-[A-Z0-9]{5}$/);
  return orderNo;
}

test.beforeAll(async ({ request }) => {
  const res = await request.get(`${API}/restaurants`).catch(() => null);
  if (!res || !res.ok()) {
    throw new Error(
      `Backend not reachable at ${API}. Start MySQL, then: cd campuseats-api && php artisan migrate:fresh --seed && php artisan serve`
    );
  }
  const list = await res.json();
  expect(list.length, "database must be seeded (run migrate:fresh --seed)").toBeGreaterThanOrEqual(6);
});

test("full order lifecycle: customer -> restaurant -> rider -> customer review -> admin", async ({ browser, request }) => {
  const customer = await loginAs(browser, "customer");
  const orderNo = await placeOrder(customer.page);
  await customer.context.close();

  // ---- Restaurant: accept -> preparing -> ready for pickup ----
  const restaurant = await loginAs(browser, "restaurant");
  await restaurant.page.goto(`/restaurant/orders/${orderNo}`);
  await restaurant.page.getByRole("button", { name: "Accept Order" }).click();
  await restaurant.page.getByRole("button", { name: "Start Preparing" }).click();
  await restaurant.page.getByRole("button", { name: "Mark Ready for Pickup" }).click();
  await expect(restaurant.page.getByRole("button", { name: "Mark Ready for Pickup" })).toHaveCount(0);
  await restaurant.context.close();

  // ---- Rider: the request shows up (10 s polling), accept, pick up, deliver ----
  const rider = await loginAs(browser, "rider");
  const availableOrderResponse = rider.page.waitForResponse(async (response) => {
    if (!response.url().includes("/api/rider/available-orders") || !response.ok()) return false;
    const data = await response.json();
    return data.some((order) => order.order_number === orderNo && order.customer?.name === "Sazib Rahman");
  });
  await rider.page.goto("/rider/deliveries");
  await availableOrderResponse;
  const card = rider.page.locator(".delivery-request-card", { hasText: orderNo });
  await expect(card).toBeVisible({ timeout: 45_000 });
  await expect(card).toContainText("Sazib Rahman"); // customer name comes from the order, not mock data
  await card.getByRole("button", { name: "Accept Delivery" }).click();
  await rider.page.waitForURL(new RegExp(`/rider/deliveries/${orderNo}`));

  await rider.page.getByRole("button", { name: "Pick Up Order" }).click();
  await rider.page.getByRole("dialog").getByRole("button", { name: "Confirm Pickup" }).click();
  await rider.page.getByRole("button", { name: "Start Delivery" }).click();
  await rider.page.getByRole("button", { name: "Mark Delivered" }).click();
  await rider.page.getByRole("dialog").getByRole("button", { name: "Mark Delivered" }).click();
  await expect(rider.page.getByRole("button", { name: "Mark Delivered" })).toHaveCount(0);

  await rider.page.goto("/rider/history");
  await expect(rider.page.getByText(orderNo).first()).toBeVisible();
  await rider.context.close();

  // ---- Customer: sees Delivered and leaves a review ----
  const reviewer = await loginAs(browser, "customer");
  const comment = `E2E review ${Date.now()}`;
  await reviewer.page.goto(`/customer/orders/${orderNo}`);
  await expect(reviewer.page.getByText("Delivered").first()).toBeVisible();
  await reviewer.page.getByLabel("5 stars").first().click();
  await reviewer.page.getByPlaceholder("Tell others what you liked about this order...").fill(comment);
  await reviewer.page.getByRole("button", { name: "Submit Review" }).click();
  await expect(reviewer.page.getByRole("button", { name: "Submit Review" })).toHaveCount(0);
  await reviewer.context.close();

  // the review really reached the server and updated the restaurant
  const reviews = await (await request.get(`${API}/restaurants/1/reviews`)).json();
  expect(reviews.some((r) => r.comment === comment)).toBe(true);

  // ---- Admin: sees the order as delivered ----
  const admin = await loginAs(browser, "admin");
  const deliveredOrderLoaded = admin.page.waitForResponse(async (response) => {
    const url = new URL(response.url());
    if (response.request().method() !== "GET" || url.pathname !== "/api/orders" || !response.ok()) return false;
    const orders = await response.json();
    return orders.some((order) => order.order_number === orderNo && order.status === "DELIVERED");
  });
  await admin.page.goto(`/admin/orders/${orderNo}`);
  await deliveredOrderLoaded;
  await expect(admin.page.getByText("Delivered").first()).toBeVisible();
  await expect(admin.page.getByText("Sazib Rahman").first()).toBeVisible(); // real customer name from the order

  await admin.context.close();
});

test("customer can cancel an order while it is still PLACED", async ({ browser }) => {
  const customer = await loginAs(browser, "customer");
  const orderNo = await placeOrder(customer.page);

  await customer.page.goto(`/customer/orders/${orderNo}`);
  await customer.page.getByRole("button", { name: "Cancel Order" }).click();
  await customer.page.getByRole("dialog").getByRole("button", { name: "Cancel Order" }).click();
  await expect(customer.page.getByText("Cancelled").first()).toBeVisible();
  await expect(customer.page.getByRole("button", { name: "Cancel Order" })).toHaveCount(0);

  await customer.context.close();
});

test("restaurant owner can reject a new order and the customer sees it", async ({ browser }) => {
  const customer = await loginAs(browser, "customer");
  const orderNo = await placeOrder(customer.page);

  const restaurant = await loginAs(browser, "restaurant");
  await restaurant.page.goto(`/restaurant/orders/${orderNo}`);
  await restaurant.page.getByRole("button", { name: "Reject Order" }).first().click();
  const rejectionResponse = restaurant.page.waitForResponse(
    (response) => response.request().method() === "PATCH" && /\/api\/orders\/\d+\/status$/.test(response.url())
  );
  await restaurant.page.getByRole("dialog").getByRole("button", { name: "Reject Order" }).click();
  const response = await rejectionResponse;
  expect(response.ok(), `Reject Order PATCH returned ${response.status()}`).toBe(true);

  await customer.page.goto(`/customer/orders/${orderNo}`);
  await customer.page.reload(); // reload this separate session after the server confirms the status update
  await expect(customer.page.getByText(/Rejected/i).first()).toBeVisible();

  await Promise.all([customer.context.close(), restaurant.context.close()]);
});

test("route guards: guests and wrong roles are redirected", async ({ browser }) => {
  const guest = await newTrackedContext(browser);
  const guestPage = await guest.newPage();
  await guestPage.goto("/customer/checkout");
  await expect(guestPage).toHaveURL(/\/login/);
  await guestPage.goto("/admin");
  await expect(guestPage).not.toHaveURL(/\/admin/);
  await guest.close();

  const customer = await loginAs(browser, "customer");
  await customer.page.goto("/admin");
  await expect(customer.page).not.toHaveURL(/\/admin/);
  await customer.page.goto("/restaurant");
  await expect(customer.page).not.toHaveURL(/\/restaurant/);
  await customer.context.close();
});

test("a customer blocked by the admin cannot log in (and is signed out)", async ({ browser, request }) => {
  const email = `blocked.${Date.now()}@e2e.test`;
  const reg = await request.post(`${API}/register`, {
    headers: { Accept: "application/json" },
    data: { name: "Block Me", email, password: "Passw0rd!", role: "customer" },
  });
  expect(reg.status()).toBe(201);
  const { user, token: customerToken } = await reg.json();

  const adminLogin = await request.post(`${API}/login`, {
    headers: { Accept: "application/json" },
    data: { email: ACCOUNTS.admin.email, password: ACCOUNTS.admin.password },
  });
  const { token: adminToken } = await adminLogin.json();

  const block = await request.patch(`${API}/admin/customers/${user.id}/status`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${adminToken}` },
    data: { status: "blocked" },
  });
  expect(block.ok()).toBe(true);

  // the token issued before the block no longer works
  const me = await request.get(`${API}/me`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${customerToken}` },
  });
  expect(me.status()).toBe(401);

  // and the login form shows the block message
  const context = await newTrackedContext(browser);
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill("Passw0rd!");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText(/blocked/i).first()).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
  await context.close();
});
