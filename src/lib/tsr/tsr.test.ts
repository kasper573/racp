import { expect } from "@jest/globals";
import * as zod from "zod";
import { RouterMatch } from "./Router";
import { Route } from "./Route";
import { TSRBuilder } from "./tsr";

describe("tsr", () => {
  const t = new TSRBuilder()
    .meta<{ title: string }>()
    .renderResult<string>()
    .build({
      path: "" as const,
      params: {},
      meta: { title: "" },
      renderer: (props: { params: {}; children?: string }): string => {
        throw new Error("Route has no renderer");
      },
      children: {},
    });

  it("can identify a single matching route", () => {
    const otherRoute = t.route.path("other");
    const fooRoute = t.route.path("foo/:num").params({ num: zod.number() });

    const router = t.router({
      fooRoute,
      otherRoute,
    });

    const matches = router.match("/foo/123");

    expectRouterMatches(matches, [fooRoute], [{ num: 123 }]);
  });

  it("can identify multiple matching routes", () => {
    const otherRoute = t.route.path("other");
    const numRoute = t.route.path("foo/:num").params({ num: zod.number() });
    const strRoute = t.route.path("foo/:str").params({ str: zod.string() });

    const router = t.router({ numRoute, strRoute, otherRoute });

    const matches = router.match("/foo/123");

    expectRouterMatches(
      matches,
      [numRoute, strRoute],
      [{ num: 123 }, { str: "123" }]
    );
  });

  it("can identify when no route matches", () => {
    const router = t.router({ single: t.route.path("some-route") });
    const active = router.match("/not-that-route");
    expect(active).toHaveLength(0);
  });

  it("can create the url for a single route", () => {
    const router = t.router({
      someRoute: t.route
        .path("some-route/:foo/:bar")
        .params({ foo: zod.string(), bar: zod.string() }),
    });
    const url = router.someRoute.url({ foo: "hello", bar: "world" });
    expect(url).toBe("/some-route/hello/world");
  });

  it("can create the url for a nested route", () => {
    const router = t.router({
      foo: t.route
        .path("foo/:foo")
        .params({ foo: zod.number() })
        .children({
          bar: t.route.path("bar/:bar").params({ bar: zod.string() }),
        }),
    });

    const url = router.foo.bar.url({ foo: 1337, bar: "world" });
    expect(url).toBe("foo/1337/bar/world");
  });

  it("can render without params", () => {
    const route = t.route.renderer(() => "Hello world");
    const result = route.render({ params: {} });
    expect(result).toBe("Hello world");
  });

  it("can render with params", () => {
    const route = t.route
      .path("/:foo")
      .params({ foo: zod.number() })
      .renderer(({ params }) => JSON.stringify(params));

    const result = route.render({ params: { foo: 123 } });
    expect(result).toBe(`{"foo":123}`);
  });

  it("can match and render nested routes", () => {
    const router = t.router({
      foo: t.route
        .path("foo")
        .renderer(({ children }) => `<foo>${children}</foo>`)
        .children({
          bar: t.route.path("bar").renderer(() => `bar`),
        }),
    });
    const match = router.match("/foo/bar");
    const result = match.reduce(
      (children, { route, params }) => route.render({ params, children }),
      ""
    );
    expect(result).toBe("<foo>bar</foo>");
  });
});

function expectRouterMatches(
  matches: RouterMatch[],
  expectedRoutes: Route[],
  expectedParams: unknown[]
) {
  expect(matches).toHaveLength(2);

  for (let i = 0; i < expectedRoutes.length; i++) {
    expect(matches[i].route).toBe(expectedRoutes[i]);
    expect(matches[i].params).toBe(expectedParams[i]);
  }
}
