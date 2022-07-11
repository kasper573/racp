import * as zod from "zod";
import { createZodMatcher } from "./zodMatcher";

describe("zodMatcher", () => {
  it("match function gets called with the correct arguments", () => {
    const fn = jest.fn(() => false);
    const matcher = createZodMatcher().add(
      "test",
      zod.string(),
      zod.string(),
      fn
    );
    matcher.match("target", { matcher: "test", value: "value" });
    expect(fn).toBeCalledWith("target", "value");
  });

  it("the correct match function gets called", () => {
    let wasCalled = false;
    const fn1 = () => (wasCalled = true);
    const fn2 = () => false;
    const matcher = createZodMatcher()
      .add("first", zod.unknown(), zod.unknown(), fn1)
      .add("second", zod.unknown(), zod.unknown(), fn2);
    matcher.match(0, { matcher: "first", value: 0 });
    expect(wasCalled).toBe(true);
  });

  it("match returns true on matching input", () => {
    const matcher = createZodMatcher().add(
      "includes",
      zod.array(zod.number()),
      zod.number(),
      (target, arg) => target.includes(arg)
    );
    const res = matcher.match([5, 10], { matcher: "includes", value: 5 });
    expect(res).toBe(true);
  });

  it("match returns false on mismatching input", () => {
    const matcher = createZodMatcher().add(
      "includes",
      zod.array(zod.number()),
      zod.number(),
      (target, arg) => target.includes(arg)
    );
    const res = matcher.match([5, 10], { matcher: "includes", value: 20 });
    expect(res).toBe(false);
  });

  it("can create argument type union for a given type", () => {
    const matcher = createZodMatcher()
      .add("ignored", zod.void(), zod.string(), () => false)
      .add("include1", zod.void(), zod.number(), () => false)
      .add("include2", zod.void(), zod.number(), () => false);

    const type = matcher.createPayloadTypeFor(zod.number());
    const payload1 = { matcher: "include1", value: 123 };
    const payload2 = { matcher: "include2", value: 234 };
    expect(type.parse(payload1)).toEqual(payload1);
    expect(type.parse(payload2)).toEqual(payload2);
  });
});
