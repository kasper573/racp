export function isPassword(
  password: string,
  passwordConfirm: string
): string | undefined {
  if (password.length < 5) {
    return "Password must be at least 5 characters";
  }
  if (password !== passwordConfirm) {
    return "Passwords do not match: " + password + ", " + passwordConfirm;
  }
  return undefined;
}
