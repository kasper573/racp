import {
  forwardRef,
  HTMLAttributes,
  MouseEvent,
  useCallback,
  useContext,
} from "react";
import { RouteLocation } from "../types";
import { RouterContext } from "./RouterContext";

export interface RouterLinkProps
  extends Omit<HTMLAttributes<HTMLAnchorElement>, "href"> {
  to: RouteLocation;
}

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function Link({ to, children, onClick, ...props }, ref) {
    const { history } = useContext(RouterContext);
    const handleClick = useCallback(
      (e: MouseEvent<HTMLAnchorElement>) => {
        if (e.ctrlKey) {
          // Ctrl click means open in new window,
          // so keep default behavior and stop any further event processing
          e.stopPropagation();
          return;
        }
        e.preventDefault();
        history.push(to);
        onClick?.(e);
      },
      [history, onClick, to]
    );
    return (
      <a ref={ref} onClick={handleClick} href={to} {...props}>
        {children}
      </a>
    );
  }
);
