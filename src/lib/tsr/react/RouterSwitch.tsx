import { History, Location } from "history";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { Router } from "../Router";
import { RouteDefinition } from "../Route";
import { TSRDefinition } from "../tsr";

export type ReactRouter = Router<
  RouteDefinition<TSRDefinition<any, ReactElement | null>>
>;

export function RouterSwitch({
  router,
  history,
}: {
  router: ReactRouter;
  history: History;
}) {
  const location = useHistoryLocation(history);
  const rendered = useMemo(
    () =>
      router
        .match(normalizeLocation(location))
        .reduce(
          (children, { route: { render: Element }, params }) => (
            <Element params={params}>{children}</Element>
          ),
          <></>
        ),
    [location, router]
  );
  return rendered;
}

function useHistoryLocation(history: History) {
  const [location, setLocation] = useState(history.location);
  useEffect(() => history.listen(setLocation), [history]);
  return location;
}

function normalizeLocation(location: Location): string {
  return location.pathname + location.search;
}
