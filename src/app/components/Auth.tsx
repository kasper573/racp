import { useSelector } from "react-redux";
import { ReactNode } from "react";
import { selectIsAuthenticated } from "../slices/auth";

export interface AuthProps {
  children: ReactNode;
  type: "protected" | "anonymous";
}

export function Auth({ children, type }: AuthProps) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (isAuthenticated && type === "protected") {
    return <>{children}</>;
  }
  if (!isAuthenticated && type === "anonymous") {
    return <>{children}</>;
  }
  return <></>;
}
