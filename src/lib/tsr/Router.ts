import { AnyRouteLike, RouteMatch } from "./types";
import { createConvenienceRoute } from "./ConvenienceRoute";
import { createCascadedRoute } from "./CascadedRoute";
import { Route } from "./Route";

export class Router<Root extends Route = any> {
  private cascade = createCascadedRoute(this.root, "", {});
  private flattened = flattenGraph(this.cascade, false);
  readonly routes = createConvenienceRoute(this.cascade);

  match(
    location: string,
    numMirrorsAllowed = 10
  ): RouteMatch<AnyRouteLike<Root>> | undefined {
    const [bestMatch] = this.flattened
      .sort((a, b) => b.depth - a.depth)
      .map(({ route }) => {
        const params = route.parseLocation(location);
        return params ? { route, params } : undefined;
      })
      .filter((match): match is RouteMatch<AnyRouteLike<Root>> => !!match);

    const mirrorTo = bestMatch?.route.def.mirror?.();
    if (mirrorTo === undefined) {
      return bestMatch;
    }

    if (numMirrorsAllowed === 0) {
      throw new Error(
        "Too many mirrored locations, stopped possible endless recursion"
      );
    }

    return this.match(mirrorTo, numMirrorsAllowed - 1);
  }

  constructor(private root: Root) {}
}

function flattenGraph<R extends Route>(
  route: R,
  includeSelf = true
): Array<{ route: Route; depth: number }> {
  return [
    ...(includeSelf ? [{ route, depth: 0 }] : []),
    ...Object.values(route.def.children).flatMap((child) =>
      flattenGraph(child as Route).map(({ route, depth }) => ({
        route,
        depth: depth + 1,
      }))
    ),
  ];
}
