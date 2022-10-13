/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
import "@deepsquare/cypress-iframe";

// Used to keep the reference to the popup window
const state: { popup: Window | null } = {
  popup: null,
};

/**
 * Intercepts calls to window.open() to keep a reference to the new window
 */
Cypress.Commands.add("capturePopup", () => {
  cy.window().then((win) => {
    const open = win.open;
    cy.stub(win, "open").callsFake((...params) => {
      // Capture the reference to the popup
      state.popup = open(...params);
      return state.popup;
    });
  });
});

/**
 * Returns a wrapped body of a captured popup
 */
Cypress.Commands.add("popup", () => {
  if (!state.popup) {
    throw new Error("No popup captured. Use `cy.capturePopup()` first.");
  }
  const popup = Cypress.$(state.popup.document);
  return cy.wrap(popup.contents().find("body"));
});

/**
 * Clicks on PayPal button and signs in
 */
Cypress.Commands.add("paypalFlow", (email, password) => {
  // Enable popup capture
  cy.capturePopup();
  // Click on the PayPal button inside PayPal's iframe
  cy.get("iframe").iframe().find('div[data-funding-source="paypal"]').click();
  // It will first inject a loader, wait until it changes to the real content
  cy.popup().find("div").should("not.exist").wait(1000); // Not recommended, but the only way I found to wait for the real content
  cy.popup().then(($body) => {
    // Check if we need to sign in
    if ($body.find("input#email").length) {
      cy.popup().find("input#email").clear().type(email);
      // Click on the button in case it's a 2-step flow
      cy.popup().find("button:visible").first().click();
      cy.popup().find("input#password").clear().type(password);
      cy.popup().find("button#btnLogin").click();
    }
  });
  cy.popup().find("button#btnLogin").should("not.exist");
  cy.wait(1000);
  cy.popup().find("div.reviewButton").should("exist");
});

/**
 * Returns the price shown in PayPal's summary
 */
Cypress.Commands.add("paypalPrice", () => {
  return cy.popup().find("span#totalWrapper");
});

/**
 * Completes PayPal flow
 */
Cypress.Commands.add("paypalComplete", () => {
  cy.popup().find("ul.charges").should("not.to.be.empty");
  cy.wait(1000);
  cy.popup().find("button.continueButton").click();
  cy.popup().find('input[data-test-id="continueButton"]').click();
});

declare global {
  namespace Cypress {
    interface Chainable {
      paypalComplete(): Chainable;
      paypalPrice(): Chainable;
      paypalFlow(email: string, password: string): Chainable;
      popup(): Chainable;
      capturePopup(): Chainable;
    }
  }
}
