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

Cypress.Commands.add(
  "isFixtureImage",
  { prevSubject: true },
  (subject: HTMLImageElement, fixtureImage) => {
    cy.wrap(subject).each(async (el) => {
      const src = el.attr("src")! || stripCssUrl(el.css("background-image"));
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(src).not.to.be.empty;

      const imageData = new Uint8Array(await (await fetch(src)).arrayBuffer());
      cy.fixture(fixtureImage, null).then(async (buffer: Buffer) => {
        const fixtureData = new Uint8Array(buffer);
        expect(imageData).deep.equal(fixtureData, "Image data is equal");
      });
    });
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

      isFixtureImage(fixtureImage: string): Chainable<Element>;
    }
  }
}

const stripCssUrl = (url = "") =>
  url.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
