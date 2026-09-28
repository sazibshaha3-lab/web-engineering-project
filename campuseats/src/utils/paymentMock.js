// Deterministic frontend-only mock payment helpers.
// No real gateway, no real financial data — purely for demoing the UI flow.

const FAILING_TEST_CARD = "4000000000000002";

export function validateMockPaymentForm(form) {
  const errors = {};
  const digits = (form.number || "").replace(/\s/g, "");

  if (!form.name?.trim()) errors.name = "Enter the cardholder name.";
  if (digits.length !== 16) errors.number = "Enter a 16-digit card number.";

  const expiry = form.expiry || "";
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) {
    errors.expiry = "Use MM/YY format.";
  } else {
    const month = Number(match[1]);
    if (month < 1 || month > 12) errors.expiry = "Enter a valid month.";
  }

  if (!/^\d{3}$/.test(form.cvv || "")) errors.cvv = "Enter a 3-digit CVV.";

  return { valid: Object.keys(errors).length === 0, errors };
}

export function simulateMockPayment(form) {
  const digits = (form.number || "").replace(/\s/g, "");
  if (digits === FAILING_TEST_CARD) {
    return { success: false };
  }
  return { success: true };
}
