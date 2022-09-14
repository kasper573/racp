import Bottleneck from "bottleneck";
import { useEffect, useMemo } from "react";

export function useBottleneck(options?: Bottleneck.ConstructorOptions) {
  const bottleneck = useMemo(() => new Bottleneck(options), [options]);
  useEffect(
    () => () => {
      async function stop() {
        try {
          await bottleneck.stop();
        } catch {
          // Ignore exception, has no negative side effects.
          // Error only thrown when stop called twice on the same instance.
          // This only happens in development due to react multi triggering hooks.
        }
      }
      stop();
    },
    [bottleneck]
  );
  return bottleneck;
}
