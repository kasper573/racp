import { createFilterMatcher } from "./filterMatcher";

describe("filterMatcher", () => {
  it("matcher function gets called with the correct arguments", () => {
    const fn = jest.fn((target: unknown, arg: unknown) => false);
    const matcher = createFilterMatcher().add("test", fn);
    matcher.match("target", { matcher: "test", value: "value" });
    expect(fn).toBeCalledWith("target", "value");
  });

  it("the correct matcher function gets called", () => {
    let wasCalled = false;
    const fn1 = (target: unknown, arg: unknown) => (wasCalled = true);
    const fn2 = (target: unknown, arg: unknown) => false;
    const matcher = createFilterMatcher().add("first", fn1).add("second", fn2);
    matcher.match(0, { matcher: "first", value: 0 });
    expect(wasCalled).toBe(true);
  });

  it("matcher returns true on matching input", () => {
    const fn = (target: number[], arg: number) => target.includes(arg);
    const matcher = createFilterMatcher().add("includes", fn);
    const res = matcher.match([5, 10], { matcher: "includes", value: 5 });
    expect(res).toBe(true);
  });
});
