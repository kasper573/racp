import { forwardRef, HTMLAttributes, MouseEvent, useContext } from "react";
import { RouteLocation } from "../types";
import { RouterContext } from "./RouterContext";

export interface RouterLinkProps
  extends Omit<HTMLAttributes<HTMLAnchorElement>, "href"> {
  to?: RouteLocation;
  href?: string;
  target?: string;
}

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function Link({ children, onClick, href, to, ...props }, ref) {
    const { history } = useContext(RouterContext);
    if (!to) {
      return (
        <a ref={ref} onClick={onClick} href={href} {...props}>
          {children}
        </a>
      );
    }

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.ctrlKey) {
        // Ctrl click means open in new window,
        // so keep default behavior and stop any further event processing
        e.stopPropagation();
      } else if (to) {
        e.preventDefault();
        history.push(to);
      }
      onClick?.(e);
    };

    return (
      <a ref={ref} onClick={handleClick} href={to} {...props}>
        {children}
      </a>
    );
  }
);
