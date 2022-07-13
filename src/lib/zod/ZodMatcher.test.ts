import * as zod from "zod";
import {
  createEntityFilter,
  createPayloadTypeFor,
  createZodMatcher,
} from "./ZodMatcher";

describe("ZodMatcher", () => {
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
});

describe("createPayloadTypeFor", () => {
  it("can create argument type union for a given type", () => {
    const matcher = createZodMatcher()
      .add("ignored", zod.string(), zod.string(), () => false)
      .add("include1", zod.number(), zod.number(), () => false)
      .add("include2", zod.number(), zod.number(), () => false);

    const type = createPayloadTypeFor(matcher, zod.number());
    const payload1 = { matcher: "include1", value: 123 };
    const payload2 = { matcher: "include2", value: 234 };
    expect(type.parse(payload1)).toEqual(payload1);
    expect(type.parse(payload2)).toEqual(payload2);
  });

  it("throws error for empty matcher", () => {
    const matcher = createZodMatcher();
    expect(() => createPayloadTypeFor(matcher, zod.any())).toThrow();
  });

  it("throws error for no matching types", () => {
    const matcher = createZodMatcher().add(
      "foo",
      zod.string(),
      zod.string(),
      () => false
    );
    expect(() => createPayloadTypeFor(matcher, zod.number())).toThrow();
  });
});

describe("createEntitySearch", () => {
  it("can filter entities", () => {
    const matcher = createZodMatcher().add(
      "gte",
      zod.number(),
      zod.number(),
      (a, b) => a >= b
    );

    const search = createEntityFilter(
      matcher,
      zod.object({
        name: zod.string(),
        count: zod.number(),
      })
    );

    const entities = [
      { name: "foo", count: 10 },
      { name: "bar", count: 15 },
      { name: "baz", count: 20 },
    ];

    const results = entities.filter(
      search.for({
        count: { matcher: "gte", value: 15 },
      })
    );

    expect(results).toEqual(entities.slice(1, 3));
  });

  it("can filter entities with non-primitive argument type", () => {
    const mmx = zod.tuple([zod.number(), zod.number()]);
    const matcher = createZodMatcher()
      .add("other", zod.string(), zod.string(), () => false)
      .add("mmx", zod.number(), mmx, (a, [min, max]) => a >= min && a <= max);

    const search = createEntityFilter(
      matcher,
      zod.object({
        name: zod.string(),
        count: zod.number(),
      })
    );

    const entities = [
      { name: "foo", count: 10 },
      { name: "bar", count: 15 },
      { name: "baz", count: 20 },
    ];

    const results = entities.filter(
      search.for({
        count: { matcher: "mmx", value: [12, 16] },
      })
    );

    expect(results).toEqual(entities.slice(1, 2));
  });

  it("exposes payload type matching the given entity type", () => {
    const matcher = createZodMatcher().add(
      "gte",
      zod.number(),
      zod.number(),
      (a, b) => a >= b
    );

    const search = createEntityFilter(
      matcher,
      zod.object({
        name: zod.string(),
        count: zod.number(),
      })
    );

    const payload = {
      count: { matcher: "gte", value: 123 },
    };

    expect(search.type.parse(payload)).toEqual(payload);
  });
});
