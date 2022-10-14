import { useEffect, useState } from "react";

export function useReinitializingState<State>(initialState: State) {
  const [state, setState] = useState(initialState);
  useEffect(() => {
    setState(initialState);
  }, [initialState]);
  return [state, setState] as const;
}
