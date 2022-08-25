import { durationString } from "./durationString";

describe("durationString", () => {
  const ms = 1;
  const s = 1000 * ms;
  const m = 60 * s;
  const h = 60 * m;
  const d = 24 * h;
  const expectations = {
    "10ms": 10 * ms,
    "10s": 10 * s,
    "10m": 10 * m,
    "10h": 10 * h,
    "10d": 10 * d,
    "14h, 15m, 20s, 30ms": 0.5 * d + 2 * h + 15 * m + 20 * s + 30 * ms,
  };
  for (const [output, input] of Object.entries(expectations)) {
    it(`should return "${output}" for ${input}`, () => {
      expect(durationString(input)).toBe(output);
    });
  }
});
