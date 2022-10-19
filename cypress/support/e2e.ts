import "./commands";
import { waitForApiReady } from "./actions/common";

Cypress.Keyboard.defaults({
  // Disabling keystroke delay since it sometimes makes some characters fail to be typed
  keystrokeDelay: 0,
});

before(() => {
  cy.exec("yarn inject-rathena-fixtures");
  cy.visit("/");
  waitForApiReady(); // Fixture injection resets API cache, so we need to wait.
});
