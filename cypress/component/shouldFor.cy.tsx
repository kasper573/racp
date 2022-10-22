import { useEffect, useState } from "react";

describe("shouldFor", () => {
  it("works", () => {
    cy.mount(<Example interval={500} />);

    cy.get("body").then(($body) =>
      cy.shouldFor(() => $body.find("#loading").length === 0, 1000)
    );

    cy.contains("Finished");
  });
});

function Example({ interval }: { interval: number }) {
  const { isLoading, isFinished } = useData(interval);
  if (isLoading) {
    return <div id="loading">Loading</div>;
  }
  if (!isFinished) {
    return <>Ready</>;
  }
  return <>Finished</>;
}

function useData(interval: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    async function simulateLoadOnce() {
      setIsLoading(true);
      await wait(interval);
      setIsLoading(false);
      await wait(interval);
    }
    async function simulateLoad() {
      let n = 5;
      while (n--) {
        await simulateLoadOnce();
      }
      setIsFinished(true);
    }
    simulateLoad();
  }, [interval]);

  return { isLoading, isFinished };
}

const wait = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));
