const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

export function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6;
}

export function isValidTime(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}
