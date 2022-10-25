import { expect } from "@jest/globals";
import * as zod from "zod";
import { omit } from "lodash";
import { RouterMatch } from "./Router";
import { Route, RouteParams } from "./Route";
import { TSRBuilder } from "./tsr";

describe("tsr", () => {
  const t = new TSRBuilder()
    .meta<{ title: string }>()
    .renderResult<string>()
    .build({
      path: "" as const,
      params: {},
      meta: { title: "" },
      renderer: (props: { params: {}; children?: string }): string =>
        `${props.children ?? ""}`,
      children: {},
    });

  it("can identify a single matching route", () => {
    const otherRoute = t.route.path("other");
    const fooRoute = t.route.path("foo/:num").params({ num: zod.number() });

    const router = t.router({
      fooRoute,
      otherRoute,
    });

    const [match] = router.match("/foo/123");

    expectRouterMatch(match, fooRoute, { num: 123 });
  });

  it("picks the first of multiple matching routes", () => {
    const otherRoute = t.route.path("other");
    const numRoute = t.route.path("foo/:num").params({ num: zod.number() });
    const strRoute = t.route.path("foo/:str").params({ str: zod.string() });

    const router = t.router({ numRoute, strRoute, otherRoute });
    const [match] = router.match("/foo/123");

    expectRouterMatch(match, numRoute, { num: 123 });
  });

  it("returns the deepest route when matching multiple routes at different depths", () => {
    const list = t.route.path("foo");
    const view = t.route.path(":id?").params({ id: zod.string().optional() });

    const router = t.router({
      list: list.children({
        view,
      }),
    });

    const matches = router.match("/foo/bar");

    expect(matches.length).toBe(3);
    expectRouterMatch(matches[0], view, { id: "bar" });
    expectRouterMatch(matches[1], list, { id: "bar" });
    expectRouterMatch(matches[2], t.route, { id: "bar" });
  });

  it("returns correct breadcrumbs when matching nested routes", () => {
    const foo = t.route.path("foo");
    const bar = t.route.path("bar");
    const baz = t.route.path("baz");

    const router = t.router({
      foo: foo.children({
        bar: bar.children({
          baz,
        }),
      }),
    });

    const matches = router.match("/foo/bar");

    expect(matches.length).toBe(3);
    expectRouterMatch(matches[0], bar, {});
    expectRouterMatch(matches[1], foo, {});
    expectRouterMatch(matches[2], t.route, {});
  });

  it("can identify when no route matches", () => {
    const router = t.router({ single: t.route.path("some-route") });
    const active = router.match("/not-that-route");
    expect(active).toHaveLength(0);
  });

  it("matcher respects match options", () => {
    const strict = t.route.path("strict", { strict: true, exact: true });
    const loose = t.route.path("loose", { strict: false, exact: true });
    const router = t.router({ strict, loose });

    let matches = router.match("/strict/");
    expect(matches).toHaveLength(0);

    matches = router.match("/strict");
    expectRouterMatch(matches[0], strict, {});

    matches = router.match("/loose/");
    expectRouterMatch(matches[0], loose, {});
  });

  it("can create the url for a single route", () => {
    const router = t.router({
      someRoute: t.route
        .path("some-route/:foo/:bar")
        .params({ foo: zod.string(), bar: zod.string() }),
    });
    const url = router.someRoute({ foo: "hello", bar: "world" });
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

    const url = router.foo.bar({ foo: 1337, bar: "world" });
    expect(url).toBe("/foo/1337/bar/world");
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

function expectRouterMatch<R extends Route>(
  match: RouterMatch,
  expectedRoute: R,
  expectedParams: RouteParams<R>
) {
  expect(omit(match.route.definition, "children")).toEqual(
    omit(expectedRoute.definition, "children")
  );
  expect(match.params).toEqual(expectedParams);
}
