/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
import "cypress-network-idle";

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
    cy.findAllByRole("option").filter(shouldSelect).click();

    // Closes the menu. Required to commit the selection.
    cy.get("body").click();

    return wrappedSubject;
  }
);

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
