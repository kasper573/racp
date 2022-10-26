import { useContext, useMemo } from "react";
import { normalizeLocation } from "../normalizeLocation";
import { ReactRouter, RouterContext } from "./RouterContext";
import { useLocation } from "./useLocation";

export type RouterSwitchVariant = "tree" | "leaf";

export function RouterSwitch({
  router,
  variant,
}: {
  router: ReactRouter;
  variant: RouterSwitchVariant;
}) {
  const { history } = useContext(RouterContext);
  const location = useLocation();
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
    <RouterContext.Provider value={{ history, match }}>
      {rendered}
    </RouterContext.Provider>
  );
}
