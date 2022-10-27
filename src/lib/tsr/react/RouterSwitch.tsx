import { useContext, useMemo } from "react";
import { normalizeLocation } from "../utils/normalizeLocation";
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
      case "tree":
        return match.breadcrumbs.reduce(
          (children, { render: Element }) => (
            <Element params={match.params}>{children}</Element>
          ),
          <></>
        );
      case "leaf": {
        const [{ render: Element }] = match.breadcrumbs;
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
