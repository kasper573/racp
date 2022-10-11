import { ReactNode, useMemo } from "react";
import { useLatest } from "./hooks/useLatest";

export function Memo<T extends object>({
  input,
  children,
}: {
  input: T;
  children: (input: T) => ReactNode;
}) {
  const latestChildren = useLatest(children);
  const memoizedChildren = useMemo(
    () => latestChildren.current(input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.values(input)
  );

  return <>{memoizedChildren}</>;
}
