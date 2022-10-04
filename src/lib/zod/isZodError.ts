import { ZodError } from "zod";

export function isZodError(error: unknown): error is Pick<ZodError, "issues"> {
  return !!(
    error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray((error as ZodError).issues)
  );
}
