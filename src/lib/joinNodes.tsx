import { ReactNode } from "react";

export function joinNodes(elements: ReactNode[], separator: ReactNode) {
  return elements.reduce(
    (prev, curr, index) => (
      <>
        {prev}
        {index !== 0 ? separator : undefined}
        {curr}
      </>
    ),
    <></>
  );
}
