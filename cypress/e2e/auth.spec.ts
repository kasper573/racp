import { assertSignedIn, signIn } from "../support/actions";

beforeEach(() => {
  cy.visit("/");
});

describe("admin", () => {
  beforeEach(() =>
    signIn(Cypress.env("ADMIN_USER"), Cypress.env("ADMIN_PASSWORD"))
  );
  it("can sign in", assertSignedIn);
  it("have access to admin menu once signed in", () => {
    cy.findByRole("menu", { name: "Admin" }).should("exist");
  });
});

describe("user", () => {
  beforeEach(() =>
    signIn(Cypress.env("MEMBER_USER"), Cypress.env("MEMBER_PASSWORD"))
  );
  it("can sign in", assertSignedIn);
  it("does not have access to admin menu", () => {
    cy.findByRole("menu", { name: "Admin" }).should("not.exist");
  });
});

describe("guest", () => {
  it("does not have access to admin menu", () => {
    cy.findByRole("menu", { name: "Admin" }).should("not.exist");
  });
});
