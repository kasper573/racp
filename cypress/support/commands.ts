/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

Cypress.Commands.add("selectFileByName", (name, files, options) => {
  return (
    cy
      .get(`input[type="file"][name="${name}"]`)
      // Assert due to cypress type definitions giving errors even though it works and following their docs
      // Force due to some file uploader UIs choosing to hide their native input elements
      .selectFile(files, { force: true, ...options }) as any
  );
});

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
