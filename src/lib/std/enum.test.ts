import { expect } from "@jest/globals";
import { matchEnumBits } from "./enum";

describe("matchEnumBits", () => {
  enum Bit {
    A = 1,
    B = 2,
    C = 4,
  }
  it("Can match singles", () => {
    expect(matchEnumBits(Bit, Bit.A)).toEqual({ A: true });
    expect(matchEnumBits(Bit, Bit.B)).toEqual({ B: true });
    expect(matchEnumBits(Bit, Bit.C)).toEqual({ C: true });
  });

  it("Can match unions of two", () => {
    expect(matchEnumBits(Bit, Bit.A | Bit.B)).toEqual({ A: true, B: true });
    expect(matchEnumBits(Bit, Bit.B | Bit.C)).toEqual({ B: true, C: true });
    expect(matchEnumBits(Bit, Bit.A | Bit.C)).toEqual({ A: true, C: true });
  });

  it("Can match unions of three", () => {
    expect(matchEnumBits(Bit, Bit.A | Bit.B | Bit.C)).toEqual({
      A: true,
      B: true,
      C: true,
    });
  });
});
