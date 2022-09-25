/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

Cypress.Commands.add(
  "slide",
  { prevSubject: "element" },
  (collection, newValueOrValues) => {
    const newValues = Array.isArray(newValueOrValues)
      ? newValueOrValues
      : [newValueOrValues];
    cy.wrap(newValues).each((newValue: number, index) => {
      changeInputValue(collection.eq(index)[0], newValue);
    });
  }
);

// This workaround is required apparently because of react
// See https://github.com/cypress-io/cypress/issues/1570
function changeInputValue(inputToChange: HTMLElement, newValue: number) {
  nativeInputValueSetter?.call(inputToChange, newValue);
  inputToChange.dispatchEvent(
    new Event("change", { newValue, bubbles: true } as any)
  );
}

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype,
  "value"
)?.set;

declare global {
  namespace Cypress {
    interface Chainable {
      slide(value: number | number[]): Chainable<Element>;
    }
  }
}
