import { range } from "lodash";
import {
  clientTextContent,
  ClientTextNode,
  clientTextType,
} from "./clientTextType";

describe("clientTextType", () => {
  it("can parse normal strings", () => {
    expect(clientTextType.parse("normal string")).toEqual({
      content: "normal string",
    });
  });

  it("can parse normal quoted strings", () => {
    expect(clientTextType.parse(`"normal quoted string"`)).toEqual({
      content: "normal quoted string",
    });
  });

  it("numbers remain strings", () => {
    expect(clientTextType.parse(`<Tag>123</Tag>`)).toEqual({
      children: [{ tag: "Tag", content: "123" }],
    });
  });

  it("can parse alphabet and common symbols", () => {
    const str = String.fromCharCode(...range(32, 127)).replace(/[<>]/g, "");
    expect(clientTextType.parse(`<Tag>${str}</Tag>`)).toEqual({
      children: [{ tag: "Tag", content: str }],
    });
  });

  it("can parse tagged strings", () => {
    expect(
      clientTextType.parse(
        `"start <First>foo</First> <Empty></Empty> <Second>bar</Second> end"`
      )
    ).toEqual({
      children: [
        { content: "start " },
        { tag: "First", content: "foo" },
        { content: " " },
        { tag: "Empty" },
        { content: " " },
        { tag: "Second", content: "bar" },
        { content: " end" },
      ],
    });
  });

  it("can get text content", () => {
    expect(
      clientTextContent(
        clientTextType.parse(
          `"start <Start>foo</Start> <Middle>1<Inner> bar </Inner>2</Middle> <End>baz</End> end"`
        )
      )
    ).toEqual("start foo 1 bar 2 baz end");
  });

  it("can ignore color values", () => {
    expect(
      clientTextType.parse(`"colored ^0000CCquoted ^FF00FFstring"`)
    ).toEqual({
      content: "colored quoted string",
    });
  });

  it("can parse its own output", () => {
    const data: ClientTextNode = {
      content: "foo",
      children: [{ tag: "bar", content: "baz" }],
    };
    expect(clientTextType.parse(data)).toEqual(data);
  });
});
