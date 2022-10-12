import { resetData, signInAsAdmin } from "../support/actions/admin";
import { clickMainMenuItem } from "../support/actions/nav";
import { findTableColumn } from "../support/actions/grid";

before(() => {
  resetData();
  cy.visit("/");
  signInAsAdmin();
});

describe("can change", () => {
  beforeEach(() => {
    clickMainMenuItem("Settings", { menuName: "Admin" });
    cy.findByRole("tab", { name: /appearance/i }).click();
  });

  it("page title", () => {
    cy.findByLabelText("Page Title").clear().type("Test Title");
    cy.findByRole("heading", { name: "Test Title" });
  });

  it("zeny colors", () => {
    cy.findByLabelText("Zeny Colors")
      .clear()
      .type(
        JSON.stringify({ dark: [[0, "green"]], light: [[0, "darkgreen"]] }),
        { parseSpecialCharSequences: false }
      );

    clickMainMenuItem("Items");

    expectZenyColor("rgb(0, 128, 0)"); // green
    cy.findByRole("button", { name: /change to light mode/i }).click();
    expectZenyColor("rgb(0, 100, 0)"); // darkgreen
  });
});

const expectZenyColor = (color: string) =>
  findTableColumn("Sell Value")
    .findByText(/\d+z$/i)
    .should("have.css", "color", color);
