/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

const disableTimeout = 999999999;
Cypress.Commands.add(
  "shouldFor",
  (
    condition,
    requiredDuration,
    {
      name = "Condition",
      interval = 10,
      timeout = Math.max(
        requiredDuration * 10,
        Cypress.config("defaultCommandTimeout")
      ),
    } = {}
  ) => {
    cy.wrap(null, { timeout: disableTimeout }).then(
      { timeout: disableTimeout },
      () =>
        new Cypress.Promise((resolve, reject) => {
          const commandStart = Date.now();
          let conditionStart = Date.now();
          let lastResult = false;
          cy.log(`${name}: Waiting to be true for ${requiredDuration}ms`);
          const intervalId = setInterval(() => {
            const now = Date.now();
            const result = condition();
            if (!result) {
              if (lastResult) {
                cy.log(
                  `${name}: Became false after being true for ${
                    now - conditionStart
                  }ms`
                );
              }
              conditionStart = now;
            }
            lastResult = result;

            const commandDuration = now - commandStart;
            if (commandDuration >= timeout) {
              clearInterval(intervalId);
              reject(new Error(`${name}: Not met within ${timeout}ms`));
              return;
            }

            const conditionDuration = now - conditionStart;
            if (conditionDuration >= requiredDuration) {
              cy.log(`${name}: Was true for ${requiredDuration}ms`);
              clearInterval(intervalId);
              resolve();
            }
          }, interval);
        })
    );
  }
);

declare global {
  namespace Cypress {
    interface Chainable {
      shouldFor(
        condition: () => boolean,
        requiredDuration: number,
        options?: { timeout?: number; interval?: number; name?: string }
      ): Chainable<void>;
    }
  }
}
