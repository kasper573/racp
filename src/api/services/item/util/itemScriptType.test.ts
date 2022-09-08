import { expect } from "@jest/globals";
import { ItemScript, itemScriptType } from "./itemScriptType";

describe("itemScriptType", () => {
  it("can find elements", () => {
    const raw = "{ bonus2 bAddRace,Ele_Fire,10;";
    expect(itemScriptType.parse(raw)).toEqual({
      raw,
      meta: {
        elements: ["Fire"],
        statuses: [],
        races: [],
      },
    });
  });

  it("can find races", () => {
    const raw = "{ bonus2 bAddRace,RC_DemiHuman,10;";
    expect(itemScriptType.parse(raw)).toEqual({
      raw,
      meta: {
        elements: [],
        statuses: [],
        races: ["DemiHuman"],
      },
    });
  });

  it("can find statuses", () => {
    const raw = "{ bonus2 bAddRace,Eff_Sleep,10;";
    expect(itemScriptType.parse(raw)).toEqual({
      raw,
      meta: {
        elements: [],
        statuses: ["Sleep"],
        races: [],
      },
    });
  });

  it("can parse its own output", () => {
    const script: ItemScript = {
      raw: "whatever",
      meta: {
        elements: [],
        statuses: ["Sleep"],
        races: [],
      },
    };
    expect(itemScriptType.parse(script)).toEqual(script);
  });
});
