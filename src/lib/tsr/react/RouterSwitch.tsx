import { useContext, useMemo } from "react";
import { normalizeLocation } from "../utils/normalizeLocation";
import { Route } from "../Route";
import { RouterContext } from "./RouterContext";
import { ReactRouter } from "./types";

export type RouterSwitchVariant = "tree" | "leaf";

export function RouterSwitch({
  router,
  variant,
}: {
  router: ReactRouter;
  variant: RouterSwitchVariant;
}) {
  const context = useContext(RouterContext);
  const { location } = context;

  const match = useMemo(
    () => router.match(normalizeLocation(location)),
    [router, location]
  );

  const rendered = useMemo(() => {
    if (!match) {
      return null;
    }
    switch (variant) {
      case "tree": {
        let rendered = <></>;
        let route: Route | undefined = match.route;
        while (route) {
          const { render: Element } = route;
          rendered = <Element params={match.params}>{rendered}</Element>;
          route = route.parent;
        }
        return rendered;
      }
      case "leaf": {
        const { render: Element } = match.route;
        return <Element params={match.params} />;
      }
    }
  }, [match, variant]);

  return (
    <RouterContext.Provider value={{ ...context, match }}>
      {rendered}
    </RouterContext.Provider>
  );
}
