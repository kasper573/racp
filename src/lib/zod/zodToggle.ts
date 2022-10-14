import * as zod from "zod";

export type ToggleName = zod.infer<typeof toggleNameType>;
export const toggleNameType = zod.string();

export type ToggleRecord = zod.infer<typeof toggleRecordType>;
export const toggleRecordType = zod
  .record(toggleNameType, zod.boolean())
  .default({});

export function resolveToggles(record: ToggleRecord = {}): ToggleName[] {
  return Object.entries(record).reduce((names, [name, on]) => {
    if (on) {
      names.push(name);
    }
    return names;
  }, [] as ToggleName[]);
}
