import { useEffect, useState } from "react";
import { useLatest } from "./useLatest";

export function useReinitializingState<State>(
  initialState: State,
  acceptStateChanges = true
) {
  const [state, setState] = useState(initialState);
  const latest = useLatest({ acceptStateChanges });
  useEffect(() => {
    if (latest.current.acceptStateChanges) {
      setState(initialState);
    }
  }, [initialState, latest]);
  return [state, setState] as const;
}
