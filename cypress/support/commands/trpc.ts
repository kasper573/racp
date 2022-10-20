/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

Cypress.Commands.add(
  "trpc",
  ((operation, options = {}) => {
    return cy
      .window()
      .then(options, (window) => operation(window.trpcClientProxy));
  }) as Cypress.Chainable["trpc"] // For some reason this assert is required.
);

declare global {
  namespace Cypress {
    interface Chainable {
      trpc<T>(
        operation: (client: Window["trpcClientProxy"]) => T,
        options?: Partial<Cypress.Timeoutable>
      ): Chainable<T>;
    }
  }
}
