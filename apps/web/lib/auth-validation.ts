// Lightweight client-side validators for the auth forms. Messages mirror the
// server's Zod messages so users see the same wording regardless of where the
// check runs. Keep these in sync with apps/server/src/modules/auth/auth.validation.ts.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginErrors = Partial<Record<"email" | "password", string>>;
export type RegisterErrors = Partial<
  Record<"name" | "email" | "password", string>
>;

function emailError(email: string): string | undefined {
  if (!email.trim()) return "Enter your email.";
  if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
  return undefined;
}

export function validateLogin(values: {
  email: string;
  password: string;
}): LoginErrors {
  const errors: LoginErrors = {};
  const email = emailError(values.email);
  if (email) errors.email = email;
  if (!values.password) errors.password = "Enter your password.";
  return errors;
}

export function validateRegister(values: {
  name: string;
  email: string;
  password: string;
}): RegisterErrors {
  const errors: RegisterErrors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  const email = emailError(values.email);
  if (email) errors.email = email;
  if (!values.password) errors.password = "Enter your password.";
  else if (values.password.length < 8)
    errors.password = "Use at least 8 characters.";
  return errors;
}
