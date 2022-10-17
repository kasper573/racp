import { expect } from "@jest/globals";
import { createResourceManager } from "./createResourceManager";

describe("createResourceManager", () => {
  it("empty manager has no factories", () => {
    const m = createResourceManager().build();
    expect(m.create).toEqual({});
  });

  it("adding factory doesnt mutate builder", () => {
    const builder = createResourceManager();
    builder.add("foo", () => ({}));
    const m = builder.build();
    expect(m.create).toEqual({});
  });

  it("adding factory creates a new manager with the new factory added", () => {
    const m = createResourceManager()
      .add("foo", () => ({}))
      .build();
    expect(m.create).toHaveProperty("foo");
  });

  it("can call factories", () => {
    const instance = {};
    const m = createResourceManager()
      .add("foo", () => instance)
      .build();
    expect(m.create.foo()).toBe(instance);
  });

  describe("instances", () => {
    it("has no instances when nothing have been created", () => {
      const m = createResourceManager().build();
      expect(m.instances).toEqual([]);
    });

    it("memorizes created instances", () => {
      const instance = {};
      const m = createResourceManager()
        .add("foo", () => instance)
        .build();
      m.create.foo();
      expect(m.instances).toContain(instance);
    });

    it("can remove memorized instance", () => {
      const instance = {};
      const m = createResourceManager()
        .add("foo", () => instance)
        .build();
      m.create.foo();
      m.dispose(instance);
      expect(m.instances).toEqual([]);
    });

    it("initializes created instances", () => {
      const initialize = jest.fn();
      const instance = { initialize };
      const m = createResourceManager()
        .add("foo", () => instance)
        .build();
      m.create.foo();
      expect(initialize).toHaveBeenCalled();
    });

    it("can dispose instance", () => {
      const dispose = jest.fn();
      const instance = { dispose };
      const m = createResourceManager()
        .add("foo", () => instance)
        .build();
      m.create.foo();
      m.dispose(instance);
      expect(dispose).toHaveBeenCalled();
    });
  });
});
