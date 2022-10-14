import { resetData, signInAsAdmin } from "../support/actions/admin";
import { gotoMainMenuPage, findMainMenuItem } from "../support/actions/nav";
import { waitForPageReady } from "../support/actions/common";

before(() => {
  resetData();
  cy.visit("/");
  signInAsAdmin();
});

beforeEach(() => {
  gotoMainMenuPage("Settings", { menuName: "Admin" });
  cy.findByRole("tab", { name: /donations/i }).click();
});

let donationsUrl: string;

it("enabling works", () => {
  updateSettingsAndGotoDonations(() =>
    cy.findByLabelText("Enable donations").check()
  );
  cy.findByRole("heading", { name: "Donations" });
  cy.url().then((url) => {
    donationsUrl = url;
  });
});

describe("disabling", () => {
  it("works", () => {
    submitSettings(() => cy.findByLabelText("Enable donations").uncheck());
    findMainMenuItem("Donations").should("not.exist");
    cy.visit(donationsUrl);
    waitForPageReady();
    cy.findByText(/you do not have permissions to access this page/i);
  });

  // Restore admin state for following tests, since this test signed us out
  after(signInAsAdmin);
});

describe("can change", () => {
  beforeEach(() =>
    submitSettings(() => cy.findByLabelText("Enable donations").check())
  );

  it("presentation", () => {
    updateSettingsAndGotoDonations(() =>
      cy.findByLabelText("Presentation").clear().type("Hello world")
    );
    cy.findByText("Hello world");
  });

  it("default donation amount", () => {
    updateSettingsAndGotoDonations(() =>
      cy.findByLabelText("Default donation amount").clear().type("100")
    );
    cy.findByLabelText("Donation amount").should("have.value", "100");
  });

  it("currency", () => {
    updateSettingsAndGotoDonations(() => cy.get(`#Currency`).select("EUR"));
    cy.findByText("EUR").should("exist");
  });

  it("exchange rate", () => {
    updateSettingsAndGotoDonations(() =>
      cy.findByLabelText("Exchange rate").clear().type("50")
    );
    cy.findByLabelText("Donation amount").clear().type("7");
    cy.findByText(/donating 7 \w+ will reward you 350 credits/i).should(
      "exist"
    );
  });
});

it("donating works", () => {
  updateSettingsAndGotoDonations(() => {
    cy.findByLabelText("Enable donations").check();
    cy.findByLabelText("Exchange rate").clear().type("8");
    cy.get(`#Currency`).select("USD");
  });

  // Assuming fake donation flow is enabled.
  // Cypress does currently not allow us to test sandbox mode due to PayPal iframes (but our code supports it).
  cy.findByLabelText("Donation amount").clear().type("6");
  cy.findByRole("button", { name: /donate/i }).click();
  cy.contains(/thank you for your donation/i);
  cy.contains(/you currently have 48 credits/i);
});

function submitSettings(editSomeSettings: Function) {
  editSomeSettings();
  cy.findByRole("form").submit();
}

function updateSettingsAndGotoDonations(editSomeSettings: Function) {
  submitSettings(editSomeSettings);
  gotoMainMenuPage("Donations");
}
