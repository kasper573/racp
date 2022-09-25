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

Cypress.Commands.add(
  "shouldBeBetween",
  { prevSubject: true },
  (subject, min, max) => {
    cy.wrap(subject).should("be.gte", min);
    cy.wrap(subject).should("be.lte", max);
  }
);

Cypress.Commands.add("closePoppers", () => {
  cy.get("body").click("bottomRight");
});

declare global {
  namespace Cypress {
    interface Chainable {
      shouldExistTemporarily(): Chainable<Element>;
      shouldBeBetween(min: number, max: number): Chainable<Element>;
      closePoppers(): Chainable<Element>;
    }
  }
}
