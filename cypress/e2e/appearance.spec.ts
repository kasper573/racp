import { resetData, signInAsAdmin } from "../support/actions/admin";
import { gotoMainMenuPage } from "../support/actions/nav";
import { waitForPageReady } from "../support/actions/common";

describe("can change", () => {
  beforeEach(() => {
    resetData();
    cy.visit("/");
    signInAsAdmin();
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

  it("home page content", () => {
    submitSettings(() =>
      cy.findByLabelText("Home Page Content").clear().type("Foo Bar Baz")
    );
    gotoMainMenuPage("rAthenaCP");
    cy.contains("Foo Bar Baz");
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
