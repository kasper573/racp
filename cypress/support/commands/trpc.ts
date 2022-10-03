/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

Cypress.Commands.add("trpc", (operation) => {
  return cy.window().then((window) => operation(window.trpcClientProxy));
});

declare global {
  namespace Cypress {
    interface Chainable {
      trpc<T>(
        operation: (client: Window["trpcClientProxy"]) => T
      ): Chainable<T>;
    }
  }
}
