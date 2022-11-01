/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

Cypress.Commands.add("selectFileByName", (name, files, options) => {
  cy.get(`input[type="file"][name="${name}"]`).selectFile(files, {
    force: true,
    ...options,
  });
});

Cypress.Commands.overwrite<"select", "element">(
  "select",
  (originalFn, subject, valueOrTextOrIndex, options) => {
    // Native selects behavior
    if (subject.prop("tagName") === "select") {
      return originalFn(subject, valueOrTextOrIndex, options);
    }

    // VTI = value or text or index
    const vtiNormalized = Array.isArray(valueOrTextOrIndex)
      ? valueOrTextOrIndex
      : [valueOrTextOrIndex];

    function shouldSelect(index: number, element: Element): boolean {
      for (const vti of vtiNormalized) {
        if (typeof vti === "number") {
          return index === vti;
        }
        if (
          element.getAttribute("value") === vti ||
          element.textContent === vti
        ) {
          return true;
        }
      }
      return false;
    }

    // Material UI selects
    const wrappedSubject = cy.wrap(subject).click();

    // Not chained because of MUI portals.
    // Potentially unsafe in case of multiple open selects, but if that happens we can refactor.
    cy.findAllByRole("option", { hidden: true })
      .filter(shouldSelect)
      .click({ force: true });

    // Closes the menu. Required to commit the selection.
    cy.closePoppers();

    return wrappedSubject;
  }
);

declare global {
  namespace Cypress {
    interface Chainable {
      selectFileByName(
        inputName: string,
        files: FileReference | FileReference[],
        options?: Partial<SelectFileOptions>
      ): Chainable<Element>;
    }
  }
}
