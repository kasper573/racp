import { removeUGC, signIn } from "../support/actions";

beforeEach(() => {
  cy.visit("/");
});

describe("admin", () => {
  beforeEach(() =>
    signIn(Cypress.env("ADMIN_USER"), Cypress.env("ADMIN_PASSWORD"))
  );

  describe("assets", () => {
    beforeEach(removeUGC);
  });
});
