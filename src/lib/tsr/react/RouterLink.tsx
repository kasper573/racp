import {
  forwardRef,
  HTMLAttributes,
  MouseEvent,
  useCallback,
  useContext,
} from "react";
import { RouterLocation } from "../Route";
import { RouterContext } from "./RouterContext";

export interface RouterLinkProps
  extends Omit<HTMLAttributes<HTMLAnchorElement>, "href"> {
  to: RouterLocation;
}

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function Link({ to, role, children, ...props }, ref) {
    const { history } = useContext(RouterContext);
    const handleClick = useCallback(
      (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        history.push(to);
        props.onClick?.(e);
      },
      [history, to]
    );
    return (
      <a ref={ref} onClick={handleClick} href={to} {...props}>
        {children}
      </a>
    );
  }
);
