import * as zod from "zod";
import { SafeParseError } from "zod/lib/types";
import { ZodArrayEntity } from "./ZodArrayEntity";

describe("ZodArrayEntity", () => {
  it("can parse its object form", () => {
    const entityType = new ZodArrayEntity([
      { foo: zod.string(), bar: zod.number() },
      {
        baz: zod.object({
          list: zod.array(zod.number()),
        }),
      },
    ]);

    const entity = entityType.parse({
      foo: "foo",
      bar: 123,
      baz: { list: [1, 2, 3] },
    });

    expect(entity).toEqual(entity);
  });

  it("returns parsed entity for valid input", () => {
    const entityType = new ZodArrayEntity([
      { foo: zod.string(), bar: zod.number() },
      {
        baz: zod.object({
          list: zod.array(zod.number()),
        }),
      },
    ]);

    const entity = entityType.parse([["foo", 123], [{ list: [1, 2, 3] }]]);
    expect(entity).toEqual({
      foo: "foo",
      bar: 123,
      baz: { list: [1, 2, 3] },
    });
  });

  it("errors for invalid input type", () => {
    const entityType = new ZodArrayEntity([
      { foo: zod.string(), bar: zod.number() },
    ]);

    const res = entityType.safeParse([["foo", "bar"]]);
    expect((res as SafeParseError<unknown>).error.issues[0]).toEqual({
      code: "invalid_type",
      message: "Expected number, received string",
      expected: "number",
      received: "string",
      path: [0, 1],
    });
  });

  it("errors for missing input", () => {
    const entityType = new ZodArrayEntity([
      { foo: zod.string(), bar: zod.number() },
    ]);

    const res = entityType.safeParse([[]]);
    expect((res as SafeParseError<unknown>).error.issues[0]).toEqual({
      code: "invalid_type",
      message: "Required",
      expected: "string",
      received: "undefined",
      path: [0, 0],
    });
    expect((res as SafeParseError<unknown>).error.issues[1]).toEqual({
      code: "invalid_type",
      message: "Required",
      expected: "number",
      received: "undefined",
      path: [0, 1],
    });
  });

  it("errors for invalid part count", () => {
    const entityType = new ZodArrayEntity([
      { foo: zod.string() },
      { bar: zod.string() },
    ]);

    const res = entityType.safeParse([["foo", "bar"]]);
    expect((res as SafeParseError<unknown>).error.issues[0]).toEqual({
      code: "custom",
      message: "Array must contain at least 2 elements",
      path: [],
    });
  });
});
