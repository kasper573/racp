import { resetData, signInAsAdmin } from "../support/actions/admin";
import { gotoMainMenuPage, findMainMenuItem } from "../support/actions/nav";
import { waitForPageReady } from "../support/actions/common";

before(() => {
  resetData();
  cy.visit("/");
});

describe("admin", () => {
  before(signInAsAdmin);

  beforeEach(() => {
    gotoMainMenuPage("Settings", { menuName: "Admin" });
    cy.findByRole("tab", { name: /donations/i }).click();
  });

  it("can enable", () => {
    cy.findByLabelText("Enable donations").check();
    gotoMainMenuPage("Donations");
    cy.findByRole("heading", { name: "Donations" });
  });

  it("can disable", () => {
    cy.findByLabelText("Enable donations").uncheck();
    findMainMenuItem("Donations").should("not.exist");
    cy.visit("/donations");
    waitForPageReady();
    cy.findByText(/you do not have permissions to access this page/i);

    // Restore admin state for following tests
    signInAsAdmin();
  });

  describe("can change", () => {
    beforeEach(() => cy.findByLabelText("Enable donations").check());

    it("presentation", () => {
      cy.findByLabelText("Presentation").clear().type("Hello world");
      gotoMainMenuPage("Donations");
      cy.findByText("Hello world");
    });

    it("default donation amount", () => {
      cy.findByLabelText("Default donation amount").clear().type("100");
      gotoMainMenuPage("Donations");
      cy.findByLabelText("Donation amount").should("have.value", "100");
    });

    it("currency", () => {
      cy.get(`#Currency`).select("EUR");
      gotoMainMenuPage("Donations");
      cy.findByText("EUR").should("exist");
    });

    it("exchange rate", () => {
      cy.findByLabelText("Exchange rate").clear().type("50");
      gotoMainMenuPage("Donations");
      cy.findByLabelText("Donation amount").clear().type("7");
      cy.findByText(/donating 7 \w+ will reward you 350 credits/i).should(
        "exist"
      );
    });
  });
});
