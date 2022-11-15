import { useContext, useMemo } from "react";
import { Route } from "../Route";
import { RouterContext } from "./RouterContext";

export type RouterSwitchVariant = "tree" | "leaf";

export function RouterSwitch({ variant }: { variant: RouterSwitchVariant }) {
  const { match } = useContext(RouterContext);

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

  return rendered;
}
