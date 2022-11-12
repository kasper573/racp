import { resetData, signInAsAdmin } from "../support/actions/admin";
import { gotoMainMenuPage } from "../support/actions/nav";
import { waitForPageReady } from "../support/actions/common";

before(() => {
  resetData();
  signInAsAdmin();
});

describe("can change", () => {
  beforeEach(() => {
    gotoMainMenuPage("Settings");
    cy.findByRole("tab", { name: /appearance/i }).click();
  });

  it("website title", () => {
    submitSettings(() =>
      cy.findByLabelText("Website Title").clear().type("Test Title")
    );
    cy.findByRole("heading", { name: "Test Title" });
    gotoMainMenuPage("Test Title");
    findHomePageBanner("Test Title");
  });

  it("home page banner", () => {
    submitSettings(() =>
      cy.selectFileByName(
        "homePageBanner",
        `${Cypress.config("fixturesFolder")}/banner.png`
      )
    );
    gotoMainMenuPage("rAthenaCP");
    findHomePageBanner("rAthenaCP").isFixtureImage("banner.png");
  });
});

function findHomePageBanner(pageTitle: string) {
  return cy.findByRole("banner", { name: pageTitle });
}

function submitSettings(editSomeSettings: Function) {
  editSomeSettings();
  waitForPageReady();
  cy.findByRole("form").submit();
  waitForPageReady();
}
