import { expect } from "@jest/globals";
import * as zod from "zod";
import { TSRBuilder } from "./tsr";
import { RouteParams, RouteMatch } from "./types";
import { Route } from "./Route";

describe("tsr", () => {
  const t = new TSRBuilder()
    .meta<{ title: string }>()
    .renders<string>()
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
    const router = t.router({
      otherRoute: t.route.path("other"),
      fooRoute: t.route.path("foo/:num").params({ num: zod.number() }),
    });

    const { routes } = router;
    const match = router.match("/foo/123");
    expectRouterMatch(match, [routes.fooRoute.$], { num: 123 });
  });

  it("picks the first of multiple matching routes", () => {
    const router = t.router({
      otherRoute: t.route.path("other"),
      numRoute: t.route.path("foo/:num").params({ num: zod.number() }),
      strRoute: t.route.path("foo/:str").params({ str: zod.string() }),
    });

    const { routes } = router;
    const match = router.match("/foo/123");
    expectRouterMatch(match, [routes.numRoute.$], { num: 123 });
  });

  it("returns the deepest route when matching multiple routes at different depths", () => {
    const router = t.router({
      list: t.route.path("foo").children({
        view: t.route.path(":id?").params({ id: zod.string().optional() }),
      }),
    });

    const { routes } = router;
    const match = router.match("/foo/bar");
    expectRouterMatch(match, [routes.list.view.$, routes.list.$], {
      id: "bar",
    });
  });

  it("returns correct breadcrumbs when matching nested routes", () => {
    const router = t.router({
      foo: t.route.path("foo").children({
        bar: t.route.path("bar").children({
          baz: t.route.path("baz"),
        }),
      }),
    });

    const match = router.match("/foo/bar");
    const { routes } = router;
    expectRouterMatch(match, [routes.foo.bar.$, routes.foo.$], {});
  });

  it("can identify when no route matches", () => {
    const router = t.router({ foo: t.route.path("some-route") });
    const active = router.match("/not-that-route");
    expect(active).toBeUndefined();
  });

  it("matcher respects match options", () => {
    const router = t.router({
      strict: t.route.path("strict", { strict: true, exact: true }),
      loose: t.route.path("loose", { strict: false, exact: true }),
    });

    let match = router.match("/strict/");
    expect(match).toBeUndefined();

    match = router.match("/strict");
    expectRouterMatch(match, [router.routes.strict.$], {});

    match = router.match("/loose/");
    expectRouterMatch(match, [router.routes.loose.$], {});
  });

  it("can convert params to location for a single route", () => {
    const route = t.route
      .path("some-route/:foo/:bar")
      .params({ foo: zod.string(), bar: zod.string() });
    const location = route({ foo: "hello", bar: "world" });
    expect(location).toBe("some-route/hello/world");
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

    const location = router.routes.foo.bar.$({
      foo: 1337,
      bar: "world",
    });
    expect(location).toBe("/foo/1337/bar/world");
  });

  it("can convert complex params to location", () => {
    const route = t.route.path("before/:foo/after").params({
      foo: zod.object({
        arr: zod.array(zod.string()),
        num: zod.number(),
        bln: zod.boolean(),
      }),
    });
    const params = {
      foo: {
        arr: ["hello", "world"],
        num: 123,
        bln: true,
      },
    };
    const location = route(params);
    expect(location).toBe(
      `before/${encodeURIComponent(JSON.stringify(params.foo))}/after`
    );
  });

  it("can match route with complex params", () => {
    const router = t.router({
      foo: t.route.path("before/:foo/after").params({
        foo: zod.object({
          arr: zod.array(zod.string()),
          num: zod.number(),
          bln: zod.boolean(),
        }),
      }),
    });
    const params = {
      foo: {
        arr: ["hello", "world"],
        num: 123,
        bln: true,
      },
    };
    const location = `/before/${encodeURIComponent(
      JSON.stringify(params.foo)
    )}/after`;
    const match = router.match(location);
    expect(match?.params).toEqual(params);
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
          bar: t.route
            .path(":bar")
            .params({ bar: zod.string() })
            .renderer(({ params: { bar } }) => bar),
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
  match: RouteMatch | undefined,
  expectedTree: R[],
  expectedParams: RouteParams<R>
) {
  expect(match).toBeDefined();
  expect(match?.params).toEqual(expectedParams);
  let route = match?.route;
  for (let i = 0; i < expectedTree.length; i++) {
    expect(route).toBe(expectedTree[i]);
    route = route?.parent;
  }
}

function renderMatch(match: RouteMatch | undefined, startContent = "") {
  if (!match) {
    return;
  }
  let content = startContent;
  let route: Route | undefined = match.route;
  while (route) {
    content = route.render({ params: match.params, children: content });
    route = route.parent;
  }
  return content;
}
