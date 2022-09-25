/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
import { unwrap } from "../actions/common";

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

Cypress.Commands.add(
  "shouldBeSortedBy",
  { prevSubject: "element" },
  (subject, compareFn) => {
    cy.wrap(subject).then((elements) => {
      const texts = unwrap(elements.map((i, e) => e.textContent));
      const sorted = [...texts].sort(compareFn);
      cy.wrap(elements).each((element, i) => {
        cy.wrap(element).should("have.text", sorted[i]);
      });
    });
  }
);

declare global {
  namespace Cypress {
    interface Chainable {
      shouldExistTemporarily(): Chainable<Element>;
      shouldBeBetween(min: number, max: number): Chainable<Element>;
      shouldBeSortedBy<T>(
        compareFn: (a: T, b: T) => number
      ): Chainable<Element>;
      closePoppers(): Chainable<Element>;
    }
  }
}
