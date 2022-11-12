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
  });

  it("home page banner title", () => {
    submitSettings(() =>
      cy.findByLabelText("Home Page Banner Title").clear().type("Banner Title")
    );
    gotoMainMenuPage("rAthenaCP");
    findHomePageBanner("Banner Title");
  });

  it("home page banner image", () => {
    submitSettings(() =>
      cy.selectFileByName(
        "homePageBanner",
        `${Cypress.config("fixturesFolder")}/banner.png`
      )
    );
    gotoMainMenuPage("rAthenaCP");
    findHomePageBanner().isFixtureImage("banner.png");
  });

  it("home page content", () => {
    submitSettings(() =>
      cy.findByLabelText("Home Page Content").clear().type("Foo Bar Baz")
    );
    gotoMainMenuPage("rAthenaCP");
    cy.contains("Foo Bar Baz");
  });
});

function findHomePageBanner(pageTitle?: string) {
  return cy.findByRole("main").findByRole("banner", { name: pageTitle });
}

function submitSettings(editSomeSettings: Function) {
  editSomeSettings();
  waitForPageReady();
  cy.findByRole("form").submit();
  waitForPageReady();
}
