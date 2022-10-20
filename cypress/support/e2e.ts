import "./commands";

Cypress.Keyboard.defaults({
  // Disabling keystroke delay since it sometimes makes some characters fail to be typed
  keystrokeDelay: 0,
});

before(() => {
  // Minor optimization: Initializing at an unknown page lets us
  // load the app without triggering any unnecessary API requests
  cy.visit("/page-that-doesnt-exist");

  if (!Cypress.env("CI")) {
    // CI already injects once before starting cypress
    // This is here to improve DX:
    // Makes it so the dev doesn't have to manually inject when making changes to fixtures.
    cy.exec("yarn inject-rathena-fixtures");
  }
});
