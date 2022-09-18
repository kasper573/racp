import { createContext, useContext } from "react";
import Bottleneck from "bottleneck";

export function useBottleneck() {
  const bottleneck = useContext(BottleneckContext);
  return bottleneck.schedule.bind(bottleneck);
}

export const BottleneckContext = createContext(
  new Bottleneck({ maxConcurrent: 20 })
);
