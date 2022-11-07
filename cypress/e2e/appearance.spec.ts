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
  });
});

function submitSettings(editSomeSettings: Function) {
  editSomeSettings();
  cy.findByRole("form").submit();
  waitForPageReady();
}
