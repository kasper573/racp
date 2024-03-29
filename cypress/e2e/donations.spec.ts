import { resetData, signInAsAdmin } from "../support/actions/admin";
import { gotoMainMenuPage, findMainMenuItem } from "../support/actions/nav";
import { waitForPageReady } from "../support/actions/common";
import { expectTableData } from "../support/actions/grid";

// Note: To test this suite you must run the RACP API with the fake donation environment

before(() => {
  resetData();
  signInAsAdmin();
});

beforeEach(() => {
  gotoMainMenuPage("Settings");
  cy.findByRole("tab", { name: /donations/i }).click();
});

let donationsUrl: string;

it("enabling works", () => {
  updateSettingsAndGotoDonations(enableDonations);
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
    cy.contains(/you do not have permissions to access this page/i);
  });

  // Restore admin state for following tests, since this test signed us out
  after(signInAsAdmin);
});

describe("can change", () => {
  beforeEach(() => submitSettings(enableDonations));

  it("presentation", () => {
    updateSettingsAndGotoDonations(() =>
      cy.findByLabelText("Presentation").clear().type("Hello world")
    );
    cy.contains("Hello world");
  });

  it("minimum donation amount", () => {
    updateSettingsAndGotoDonations(() =>
      cy.findByLabelText("Minimum donation amount").clear().type("100")
    );
    cy.findByLabelText("Donation amount").should("have.value", "100");
  });

  it("currency", () => {
    updateSettingsAndGotoDonations(() => cy.get(`#Currency`).select("EUR"));
    cy.contains("EUR");
  });

  it("exchange rate", () => {
    updateSettingsAndGotoDonations(() => {
      cy.findByLabelText("Minimum donation amount").clear().type("5");
      cy.findByLabelText("Exchange rate").clear().type("50");
    });
    cy.findByLabelText("Donation amount").clear().type("7");
    cy.contains(/donating 7 \w+ will reward you 350 credits/i);
  });
});

describe("donating", () => {
  beforeEach(() => {
    resetData();
    updateSettingsAndGotoDonations(() => {
      enableDonations();
      cy.findByLabelText("Exchange rate").clear().type("8");
      cy.get(`#Currency`).select("USD");
    });
  });

  it("rewards you with the correct amount of credits", () => {
    cy.findByLabelText("Donation amount").clear().type("6");

    paypalFlow();

    cy.contains(/thank you for your donation/i);
    cy.contains(/you currently have 48 credits/i);
  });

  it.skip("internal server errors informs the user and yields no credits", () => {
    // TODO: Unskip this dest once we have implemented a way to force an internal server error
    cy.findByLabelText("Donation amount").clear().type("999");

    paypalFlow();

    cy.contains(/something went wrong/i);
    cy.contains(/you currently have 0 credits/i);
  });
});

it("can list redeemable items", () => {
  updateSettingsAndGotoDonations(enableDonations);
  cy.findByRole("link", { name: /redeemable items/i }).click();
  waitForPageReady();
  expectTableData([["Test Item [3]", "50 credits"]]);
});

function paypalFlow() {
  // Assuming fake donation flow is enabled.
  // Cypress does currently not allow us to test sandbox mode due to PayPal iframes (but our code supports it).
  // Once cypress supports iframes we can replace this line with the actual PayPal flow
  cy.findByRole("button", { name: /donate/i }).click();
}

function submitSettings(editSomeSettings: Function) {
  editSomeSettings();
  cy.findByRole("form").submit();
  waitForPageReady();
}

function updateSettingsAndGotoDonations(editSomeSettings: Function) {
  submitSettings(editSomeSettings);
  gotoMainMenuPage("Donations");
}

function enableDonations() {
  cy.findByLabelText("Enable donations").check();
  cy.findByLabelText("PayPal Merchant ID").clear().type("test");
  cy.findByLabelText("PayPal Client ID").clear().type("test");
  cy.findByLabelText("PayPal Client Secret").clear().type("test");
}
