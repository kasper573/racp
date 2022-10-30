import { resetData, signInAsAdmin } from "../support/actions/admin";
import { gotoMainMenuPage } from "../support/actions/nav";

before(() => {
  resetData();
  signInAsAdmin();
});

describe("can change", () => {
  beforeEach(() => {
    gotoMainMenuPage("Settings");
    cy.findByRole("tab", { name: /appearance/i }).click();
  });

  it("page title", () => {
    submitSettings(() =>
      cy.findByLabelText("Page Title").clear().type("Test Title")
    );
    cy.findByRole("heading", { name: "Test Title" });
  });
});

function submitSettings(editSomeSettings: Function) {
  editSomeSettings();
  cy.findByRole("form").submit();
}
