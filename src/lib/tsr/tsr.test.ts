import { expect } from "@jest/globals";
import * as zod from "zod";
import { omit } from "lodash";
import { RouterMatch } from "./Router";
import { Route, RouteParams } from "./Route";
import { TSRBuilder } from "./tsr";

describe("tsr", () => {
  const t = new TSRBuilder()
    .meta<{ title: string }>()
    .renders<string>()
    .protocol({ parse: (s) => s, stringify: (s) => `${s}` })
    .build({
      path: "" as const,
      params: {},
      meta: { title: "" },
      renderer: (props: { params: {}; children?: string }): string =>
        `${props.children ?? ""}`,
      children: {},
      middlewares: [],
    });

  it("can identify a single matching route", () => {
    const otherRoute = t.route.path("other");
    const fooRoute = t.route.path("foo/:num").params({ num: zod.number() });

    const router = t.router({
      fooRoute,
      otherRoute,
    });

    const match = router.match("/foo/123");
    expectRouterMatch(match, [fooRoute], { num: 123 });
  });

  it("picks the first of multiple matching routes", () => {
    const otherRoute = t.route.path("other");
    const numRoute = t.route.path("foo/:num").params({ num: zod.number() });
    const strRoute = t.route.path("foo/:str").params({ str: zod.string() });

    const router = t.router({ numRoute, strRoute, otherRoute });
    const match = router.match("/foo/123");

    expectRouterMatch(match, [numRoute], { num: 123 });
  });

  it("returns the deepest route when matching multiple routes at different depths", () => {
    const list = t.route.path("foo");
    const view = t.route.path(":id?").params({ id: zod.string().optional() });

    const router = t.router({
      list: list.children({
        view,
      }),
    });

    const match = router.match("/foo/bar");
    expectRouterMatch(match, [view, list], { id: "bar" });
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

    const match = router.match("/foo/bar");
    expectRouterMatch(match, [bar, foo], {});
  });

  it("can identify when no route matches", () => {
    const router = t.router({ single: t.route.path("some-route") });
    const active = router.match("/not-that-route");
    expect(active).toBeUndefined();
  });

  it("matcher respects match options", () => {
    const strict = t.route.path("strict", { strict: true, exact: true });
    const loose = t.route.path("loose", { strict: false, exact: true });
    const router = t.router({ strict, loose });

    let match = router.match("/strict/");
    expect(match).toBeUndefined();

    match = router.match("/strict");
    expectRouterMatch(match, [strict], {});

    match = router.match("/loose/");
    expectRouterMatch(match, [loose], {});
  });

  it("can convert params to location for a single route", () => {
    const router = t.router({
      someRoute: t.route
        .path("some-route/:foo/:bar")
        .params({ foo: zod.string(), bar: zod.string() }),
    });
    const location = router.someRoute({ foo: "hello", bar: "world" });
    expect(location).toBe("/some-route/hello/world");
  });

  it("can convert params to location for a nested route", () => {
    const router = t.router({
      foo: t.route
        .path("foo/:foo")
        .params({ foo: zod.number() })
        .children({
          bar: t.route.path("bar/:bar").params({ bar: zod.string() }),
        }),
    });

    const location = router.foo.bar({ foo: 1337, bar: "world" });
    expect(location).toBe("/foo/1337/bar/world");
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
    const result = renderMatch(match);
    expect(result).toBe("<foo>bar</foo>");
  });

  it("middlewares compose the renderer correctly", () => {
    const router = t.router({
      foo: t.route
        .renderer(({ children }) => `<foo>${children}</foo>`)
        .use(
          (next) => (props) =>
            next({ ...props, children: `<inner>${props.children}</inner>` })
        )
        .use((next) => (props) => `<outer>${next(props)}</outer>`),
    });
    const match = router.match("/");
    const result = renderMatch(match, "bar");
    expect(result).toBe("<outer><foo><inner>bar</inner></foo></outer>");
  });
});

function expectRouterMatch<R extends Route>(
  match: RouterMatch | undefined,
  expectedBreadcrumbs: R[],
  expectedParams: RouteParams<R>
) {
  expect(match).toBeDefined();
  expect(match?.breadcrumbs).toHaveLength(expectedBreadcrumbs.length + 1); // + 1 for root route
  expect(match?.params).toEqual(expectedParams);

  for (let i = 0; i < expectedBreadcrumbs.length; i++) {
    const expectedRoute = expectedBreadcrumbs[i];
    expect(omit(match?.breadcrumbs[i].definition, "children")).toEqual(
      omit(expectedRoute.definition, "children")
    );
  }
}

function renderMatch(match: RouterMatch | undefined, startContent = "") {
  if (!match) {
    return;
  }
  return match.breadcrumbs.reduce(
    (children, route) => route.render({ params: match.params, children }),
    startContent
  );
}
