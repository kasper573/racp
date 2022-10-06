import { expect } from "@jest/globals";
import { determineMvpLifeStatus } from "./determineMvpLifeStatus";

describe("determineMvpLifeStatus", () => {
  it("should be alive if killed in the future", () => {
    const status = determineMvpLifeStatus(0, { killedAt: 50 });
    expect(status).toEqual("Alive");
  });

  it("should be alive if killed in the past, but with instant spawn", () => {
    const status = determineMvpLifeStatus(100, {
      killedAt: 0,
    });
    expect(status).toEqual("Alive");
  });

  it("should be dead if killed within spawn delay", () => {
    const status = determineMvpLifeStatus(50, {
      killedAt: 0,
      spawnDelay: 100,
    });
    expect(status).toEqual("Dead");
  });

  it("should be alive if killed before spawn delay", () => {
    const status = determineMvpLifeStatus(101, {
      killedAt: 0,
      spawnDelay: 100,
    });
    expect(status).toEqual("Alive");
  });

  it("should be spawning if current time is within spawning window", () => {
    const status = determineMvpLifeStatus(100, {
      killedAt: 0,
      spawnDelay: 90,
      spawnWindow: 20,
    });
    expect(status).toEqual("Spawning");
  });
});
