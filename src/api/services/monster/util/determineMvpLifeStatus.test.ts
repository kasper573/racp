import { expect } from "@jest/globals";
import { determineMvpLifeStatus } from "./determineMvpLifeStatus";

describe("determineMvpLifeStatus", () => {
  it("should be alive if killed in the future", () => {
    const result = determineMvpLifeStatus(0, { killedAt: 50 });
    expect(result).toEqual("alive");
  });

  it("should be alive if killed in the past, but with instant spawn", () => {
    const result = determineMvpLifeStatus(100, {
      killedAt: 0,
    });
    expect(result).toEqual("alive");
  });

  it("should be dead if killed within spawn delay", () => {
    const result = determineMvpLifeStatus(50, {
      killedAt: 0,
      spawnDelay: 100,
    });
    expect(result).toEqual("dead");
  });

  it("should be alive if killed before spawn delay", () => {
    const result = determineMvpLifeStatus(101, {
      killedAt: 0,
      spawnDelay: 100,
    });
    expect(result).toEqual("alive");
  });

  it("should be spawning if current time is within spawning window", () => {
    const result = determineMvpLifeStatus(100, {
      killedAt: 0,
      spawnDelay: 90,
      spawnWindow: 20,
    });
    expect(result).toEqual("spawning");
  });
});
