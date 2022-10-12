import { resetData, signInAsAdmin } from "../support/actions/admin";
import { gotoMainMenuPage, findMainMenuItem } from "../support/actions/nav";
import { waitForPageReady } from "../support/actions/common";

before(() => {
  resetData();
  cy.visit("/");
});

describe("settings", () => {
  before(signInAsAdmin);

  beforeEach(() => {
    gotoMainMenuPage("Settings", { menuName: "Admin" });
    cy.findByRole("tab", { name: /donations/i }).click();
  });

  let donationsUrl: string;

  it("can be enabled", () => {
    cy.findByLabelText("Enable donations").check();
    gotoMainMenuPage("Donations");
    cy.findByRole("heading", { name: "Donations" });
    cy.url().then((url) => {
      donationsUrl = url;
    });
  });

  it("can be disabled", () => {
    cy.findByLabelText("Enable donations").uncheck();
    findMainMenuItem("Donations").should("not.exist");
    cy.visit(donationsUrl);
    waitForPageReady();

    cy.findByText(/you do not have permissions to access this page/i);
  });

  describe("can change", () => {
    before(signInAsAdmin);
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
  });
});
