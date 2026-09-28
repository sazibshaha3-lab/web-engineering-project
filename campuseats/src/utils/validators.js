export function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value = "") {
  const digits = value.replace(/[\s-]/g, "");
  return /^\+?\d{10,14}$/.test(digits);
}

export function isValidEmailOrPhone(value = "") {
  return isValidEmail(value) || isValidPhone(value);
}

export function isValidPasswordFormat(value = "") {
  // UI minimum rule: at least 8 characters, one letter and one number.
  return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}
