import "./commands";

Cypress.Keyboard.defaults({
  // Disabling keystroke delay since it sometimes makes some characters fail to be typed
  keystrokeDelay: 0,
});

before(() => {
  // Minor optimization: Initializing at an unknown page lets us
  // load the app without triggering any unnecessary API requests
  cy.visit("/page-that-doesnt-exist");
});

afterEach(() => {
  cy.get("@consoleError").should("not.have.been.called");
});
