/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

Cypress.Commands.add(
  "shouldExistTemporarily",
  { prevSubject: "element" },
  (subject) => {
    cy.wrap(subject).should("exist");
    cy.wrap(subject).should("not.exist");
  }
);

declare global {
  namespace Cypress {
    interface Chainable {
      shouldExistTemporarily(): Chainable<Element>;
    }
  }
}
