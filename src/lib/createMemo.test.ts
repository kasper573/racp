import { expect } from "@jest/globals";
import { createAsyncMemo } from "./createMemo";

describe("createAsyncMemo", () => {
  it("computes only once for the same sources", async () => {
    let computations = 0;
    const val = {};
    const load = createAsyncMemo(
      async () => [val],
      (val) => {
        computations++;
        return val;
      }
    );
    await load();
    await load();
    expect(computations).toBe(1);
  });

  it("computes once per source change", async () => {
    let computations = 0;
    let val = {};
    const load = createAsyncMemo(
      async () => [val],
      (val) => {
        computations++;
        return val;
      }
    );

    await load();
    val = {};
    await load();
    expect(computations).toBe(2);
  });
});
