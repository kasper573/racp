import "./commands";

Cypress.Keyboard.defaults({
  // Disabling keystroke delay since it sometimes makes some characters fail to be typed
  keystrokeDelay: 0,
});

before(() => {
  //cy.exec("yarn run reset-data");
});
