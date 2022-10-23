import { resolveToggles, ToggleRecord } from "../../lib/zod/zodToggle";

export function renderToggles(toggles: ToggleRecord = {}): string {
  return resolveToggles(toggles).join(", ") || "-";
}
