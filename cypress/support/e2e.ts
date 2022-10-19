import "./commands";

Cypress.Keyboard.defaults({
  // Disabling keystroke delay since it sometimes makes some characters fail to be typed
  keystrokeDelay: 0,
});

// Minor optimization: Initializing at an unknown page lets us
// load the app without triggering any unnecessary API requests
before(() => cy.visit("/page-that-doesnt-exist"));
