import Bottleneck from "bottleneck";
import { useEffect, useMemo } from "react";

export function useBottleneck(options?: Bottleneck.ConstructorOptions) {
  const bottleneck = useMemo(() => new Bottleneck(options), [options]);
  useEffect(
    () => () => {
      bottleneck.running().then((active) => {
        if (active) {
          bottleneck.stop();
        }
      });
    },
    [bottleneck]
  );
  return bottleneck;
}