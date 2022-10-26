import { useContext, useMemo } from "react";
import { normalizeLocation } from "../normalizeLocation";
import { ReactRouter, RouterContext } from "./RouterContext";
import { useLocation } from "./useLocation";

export function RouterSwitch({ router }: { router: ReactRouter }) {
  const { history } = useContext(RouterContext);
  const location = useLocation();
  const match = useMemo(
    () => router.match(normalizeLocation(location)),
    [router, location]
  );

  const rendered = useMemo(
    () =>
      match &&
      match.breadcrumbs.reduce(
        (children, { render: Element }) => (
          <Element params={match.params}>{children}</Element>
        ),
        <></>
      ),
    [match]
  );

  return (
    <RouterContext.Provider value={{ history, match }}>
      {rendered}
    </RouterContext.Provider>
  );
}
