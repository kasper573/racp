import {
  assertSignedIn,
  register,
  signIn,
  signOut,
} from "../support/actions/user";
import { signInAsAdmin } from "../support/actions/admin";

beforeEach(() => {
  cy.visit("/");
});

describe("admin", () => {
  beforeEach(signInAsAdmin);
  it("can sign in", () => assertSignedIn());
  it("have access to admin menu once signed in", () => {
    cy.findByRole("menu", { name: "Admin" }).should("exist");
  });
});

describe("user", () => {
  it("can register and is signed in after", () => {
    register("registerTest", "foobar", "reg@bar.com");
    assertSignedIn("registerTest");
  });

  it("register and then sign in", () => {
    register("signInTest", "foobar", "sign@bar.com");
    signOut();
    signIn("signInTest", "foobar");
    assertSignedIn("signInTest");
  });

  it("does not have access to admin menu", () => {
    register("noAdmin", "foobar", "no-admin@bar.com");
    assertSignedIn("noAdmin");
    cy.findByRole("menu", { name: "Admin" }).should("not.exist");
  });
});

describe("guest", () => {
  it("does not have access to admin menu", () => {
    cy.findByRole("menu", { name: "Admin" }).should("not.exist");
  });
});
