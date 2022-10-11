import { expect } from "@jest/globals";
import { parseTextEntities, replaceScripts } from "./ScriptDriver";

describe("parseTextEntities", () => {
  describe("can parse", () => {
    it("multiple entities", () => {
      const entities = parseTextEntities(`
tightly,1\tfoo
stacked,2\tbar
entities,3\tbaz
      `);

      expect(entities).toEqual([
        [["tightly", "1"], ["foo"]],
        [["stacked", "2"], ["bar"]],
        [["entities", "3"], ["baz"]],
      ]);
    });

    it("leading empty value", () => {
      const entities = parseTextEntities(`,foo`);
      expect(entities).toEqual([[["", "foo"]]]);
    });

    it("trailing empty value", () => {
      const entities = parseTextEntities(`foo,`);
      expect(entities).toEqual([[["foo", ""]]]);
    });

    it("leading empty part", () => {
      const entities = parseTextEntities(`\tfoo`);
      expect(entities).toEqual([[[""], ["foo"]]]);
    });

    it("trailing empty part", () => {
      const entities = parseTextEntities(`foo\t`);
      expect(entities).toEqual([[["foo"], [""]]]);
    });

    describe("scripts", () => {
      it("at the start", () => {
        const entities = parseTextEntities(`${mockScript()},after`);
        expect(entities).toEqual([[[mockScript(), "after"]]]);
      });

      it("in the middle", () => {
        const entities = parseTextEntities(`before,${mockScript()},after`);
        expect(entities).toEqual([[["before", mockScript(), "after"]]]);
      });

      it("at the end", () => {
        const entities = parseTextEntities(`before,${mockScript()}`);
        expect(entities).toEqual([[["before", mockScript()]]]);
      });

      it("in a row", () => {
        const entities = parseTextEntities(`
script1,${mockScript(1)}
script2,${mockScript(2)}
script3,${mockScript(3)}
      `);

        expect(entities).toEqual([
          [["script1", mockScript(1)]],
          [["script2", mockScript(2)]],
          [["script3", mockScript(3)]],
        ]);
      });
    });
  });

  it("can ignore comments / empty whitespace lines", () => {
    const comment = "// comment";
    const entities = parseTextEntities(`
${comment}
        
foo,1
          
bar,2
    `);

    const entitiesAsString = JSON.stringify(entities);
    expect(entitiesAsString).not.toMatch(/[\n\s]/);
    expect(entitiesAsString).not.toEqual(expect.stringContaining(comment));
  });

  it("can replace scripts", () => {
    const wrap = (script: string) => `before ${script} after`;
    const id = "[placeholder]";
    const result = replaceScripts(wrap(mockScript()), () => id);
    expect(result).toEqual({
      text: wrap(id),
      scripts: { [id]: mockScript() },
    });
  });
});

const mockScript = (seed?: number) => `{
  {
    test("script${seed ?? ""}")      
  }
}`;
