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
  cy.findByLabelText("Enable donations").check();
  gotoMainMenuPage("Donations");
  cy.findByRole("heading", { name: "Donations" });
  cy.url().then((url) => {
    donationsUrl = url;
  });
});

describe("disabling", () => {
  it("works", () => {
    cy.findByLabelText("Enable donations").uncheck();
    findMainMenuItem("Donations").should("not.exist");
    cy.visit(donationsUrl);
    waitForPageReady();
    cy.findByText(/you do not have permissions to access this page/i);
  });

  // Restore admin state for following tests, since this test signed us out
  after(signInAsAdmin);
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

it.only("donating works", () => {
  cy.findByLabelText("Enable donations").check();
  configurePayPal();
  gotoMainMenuPage("Donations");
  cy.findByLabelText("Donation amount").clear().type("7");
  cy.paypalFlow(
    Cypress.env("PAYPAL_CUSTOMER_EMAIL"),
    Cypress.env("PAYPAL_CUSTOMER_PASSWORD")
  );
  cy.paypalPrice().should("to.contain", "$7.00 USD");
  cy.paypalComplete();
  cy.get("div#completed").should("exist");
});

function configurePayPal({
  merchantId = Cypress.env("PAYPAL_MERCHANT_ID"),
  clientId = Cypress.env("PAYPAL_CLIENT_ID"),
  clientSecret = Cypress.env("PAYPAL_CLIENT_SECRET"),
} = {}) {
  cy.findByLabelText("Paypal Merchant ID").clear().type(merchantId);
  cy.findByLabelText("Paypal Client ID").clear().type(clientId);
  cy.findByLabelText("Paypal Client Secret").clear().type(clientSecret);
}
