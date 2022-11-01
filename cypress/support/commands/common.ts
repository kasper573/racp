/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
import { unwrap } from "../actions/common";

Cypress.Commands.add(
  "shouldBeBetween",
  { prevSubject: true },
  (subject, min, max) => {
    cy.wrap(subject).should("be.gte", min);
    cy.wrap(subject).should("be.lte", max);
  }
);

Cypress.Commands.add("closePoppers", () => {
  cy.get("body").click("bottomRight", { force: true });
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

Cypress.Commands.overwrite("exec", (originalFn, command, options) => {
  // Workaround to not truncate log
  // https://github.com/cypress-io/cypress/issues/5470#issuecomment-569627930
  return originalFn(command, { ...options, failOnNonZeroExit: false }).then(
    (result) => {
      if (result.code && options?.failOnNonZeroExit !== false) {
        throw new Error(`Execution of "${command}" failed
      Exit code: ${result.code}
      Stdout:\n${result.stdout}
      Stderr:\n${result.stderr}`);
      }
    }
  );
});

declare global {
  namespace Cypress {
    interface Chainable {
      shouldBeBetween(min: number, max: number): Chainable<Element>;
      shouldBeSortedBy<T>(
        compareFn: (a: T, b: T) => number
      ): Chainable<Element>;
      closePoppers(): Chainable<Element>;
    }
  }
}
