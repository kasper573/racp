/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

Cypress.Commands.add("selectFileByName", (name, files, options) => {
  cy.get(`input[type="file"][name="${name}"]`).selectFile(files, {
    force: true,
    ...options,
  });
});

Cypress.Commands.add("imageSrc", { prevSubject: true }, (subject: JQuery) => {
  const tagName = subject.prop("tagName");
  if (tagName === "IMG") {
    cy.wrap(subject)
      .should("not.have.attr", "src", "")
      .then((element) => element.attr("src"));
  } else {
    cy.wrap(subject)
      .should("not.have.css", "background-image", "none")
      .then((element) => stripCssUrl(element.css("background-image")));
  }
});

Cypress.Commands.add(
  "isFixtureImage",
  { prevSubject: true },
  (subject, fixtureSrc) => {
    cy.wrap(subject)
      .imageSrc()
      .then(async (subjectSrc) => {
        const subjectData = new Uint8Array(
          await (await fetch(subjectSrc)).arrayBuffer()
        );
        cy.fixture(fixtureSrc, null).then(async (buffer: Buffer) => {
          const fixtureData = new Uint8Array(buffer);
          expect(subjectData).deep.equal(
            fixtureData,
            `Subject data in "${subjectSrc}" should equal fixture data in "${fixtureSrc}"`
          );
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

      imageSrc(): Chainable<string>;
    }
  }
}

const stripCssUrl = (url = "") =>
  url.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
