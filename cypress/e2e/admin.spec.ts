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
      .type(JSON.stringify({ dark: [[0, "pink"]], light: [[0, "tomato"]] }), {
        parseSpecialCharSequences: false,
      });

    // Wait for change to be submitted before leaving page
    waitForPageReady();

    clickMainMenuItem("Items");

    expectZenyColor("rgb(255, 192, 203)"); // pink
    cy.findByRole("button", { name: /change to light mode/i }).click();
    expectZenyColor("rgb(255, 99, 71)"); // tomato
  });
});

const expectZenyColor = (color: string) =>
  findTableColumn("Sell Value")
    .findByText(/\d+z$/i)
    .should("have.css", "color", color);
