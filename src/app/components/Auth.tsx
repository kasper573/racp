import { ReactNode } from "react";
import { useAppSelector } from "../store";

export interface AuthProps {
  children: ReactNode;
  type: "protected" | "anonymous";
}

export function Auth({ children, type }: AuthProps) {
  const isAuthenticated = useAppSelector(({ auth }) => !!auth.token);
  if (isAuthenticated && type === "protected") {
    return <>{children}</>;
  }
  if (!isAuthenticated && type === "anonymous") {
    return <>{children}</>;
  }
  return <></>;
}
