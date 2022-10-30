import { resetData, signInAsAdmin } from "../support/actions/admin";
import { gotoMainMenuPage } from "../support/actions/nav";
import { findTableColumn } from "../support/actions/grid";

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

  it("zeny colors", () => {
    submitSettings(() =>
      cy
        .findByLabelText("Zeny Colors")
        .clear()
        .type(
          JSON.stringify({ dark: [[0, "green"]], light: [[0, "darkgreen"]] }),
          { parseSpecialCharSequences: false }
        )
    );

    gotoMainMenuPage("Items");

    expectZenyColor("rgb(0, 128, 0)"); // green
    cy.findByRole("button", { name: /change to light mode/i }).click();
    expectZenyColor("rgb(0, 100, 0)"); // darkgreen
  });
});

function submitSettings(editSomeSettings: Function) {
  editSomeSettings();
  cy.findByRole("form").submit();
}

const expectZenyColor = (color: string) =>
  findTableColumn("Sell Value")
    .findByText(/\d+z$/i)
    .should("have.css", "color", color);
