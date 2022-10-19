import "./commands";
import { waitForApiReady } from "./actions/common";

Cypress.Keyboard.defaults({
  // Disabling keystroke delay since it sometimes makes some characters fail to be typed
  keystrokeDelay: 0,
});

before(() => {
  cy.visit("/");

  // Sometimes tests start before the API is ready.
  // This may cause tests to time out, so we wait for it to be ready first.
  waitForApiReady();
});
