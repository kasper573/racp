import { resetData, signInAsAdmin } from "../support/actions/admin";
import { clickMainMenuItem } from "../support/actions/nav";
import { findTableColumn } from "../support/actions/grid";
import { waitForPageReady } from "../support/actions/common";

before(() => {
  resetData();
  cy.visit("/");
  signInAsAdmin();
});

describe("can change settings", () => {
  beforeEach(() => clickMainMenuItem("Settings", { menuName: "Admin" }));
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

    // Wait for change to be submitted before leaving page
    waitForPageReady();

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
