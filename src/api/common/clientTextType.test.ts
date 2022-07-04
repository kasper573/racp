import {
  ClientTextData,
  clientTextToString,
  clientTextType,
} from "./clientTextType";

describe("clientTextType", () => {
  it("can parse normal strings", () => {
    expect(clientTextType.parse("normal string")).toEqual([
      { text: "normal string" },
    ]);
  });

  it("can parse normal quoted strings", () => {
    expect(clientTextType.parse(`"normal quoted string"`)).toEqual([
      { text: "normal quoted string" },
    ]);
  });

  it("invalid hex-like strings are ignored", () => {
    expect(clientTextType.parse(`"^0000 quoted string"`)).toEqual([
      { text: "^0000 quoted string" },
    ]);
  });

  it("can parse quoted colored strings", () => {
    expect(
      clientTextType.parse(`"colored ^0000CCquoted ^FF00FFstring"`)
    ).toEqual([
      { text: "colored " },
      { text: "quoted ", color: "0000CC" },
      { text: "string", color: "FF00FF" },
    ]);
  });

  it("can normalize text data to string", () => {
    expect(
      clientTextToString(clientTextType.parse(`"foo ^0000CCbar ^FF00FFbaz"`))
    ).toEqual("foo bar baz");
  });

  it("can parse its own output", () => {
    const data: ClientTextData = [
      { text: "foo" },
      { text: "bar", color: "0000CC" },
    ];
    expect(clientTextType.parse(data)).toEqual(data);
  });
});
