import { ignoreCase } from "../util";
import { waitForPageReady } from "./common";

export function openUserMenu() {
  cy.findByRole("button", { name: ignoreCase("open user menu") }).click();
  return cy.findByRole("menu", { name: ignoreCase("user menu") });
}

export function clickUserMenuItem(name: string) {
  openUserMenu()
    .findByRole((role) => /link|button|listitem|menuitem/i.test(role), {
      name: ignoreCase(name),
    })
    .click();
  waitForPageReady();
}

export function register(username: string, password: string, email: string) {
  clickUserMenuItem("register");

  cy.findByLabelText("Username").type(username);
  cy.findByLabelText("Email").type(email);
  cy.findByLabelText("Password").type(password);
  cy.findByLabelText("Password (confirm)").type(password);
  cy.findByRole("button", { name: "Register" }).click();
  waitForPageReady();
}

export function updateProfile({
  email,
  password,
}: {
  email?: string;
  password?: string;
}) {
  clickUserMenuItem("Settings");
  if (email !== undefined) {
    cy.findByLabelText("Email").clear().type(email);
  }
  if (password !== undefined) {
    cy.findByLabelText("New password").clear().type(password);
    cy.findByLabelText("New password (confirm)").clear().type(password);
  }
  cy.findByRole("button", { name: "Save" }).click();
  waitForPageReady();
}

export function signIn(
  username: string,
  password: string,
  { waitForRedirect = true } = {}
) {
  clickUserMenuItem("Sign in");
  cy.findByLabelText("Username").type(username);
  cy.findByLabelText("Password").type(password);
  cy.url().then((urlForSignInPage) => {
    cy.findByRole("button", { name: "Sign in" }).click();
    if (waitForRedirect) {
      waitForPageReady();
      cy.url().should("not.equal", urlForSignInPage);
      waitForPageReady();
    }
  });
}

export function signOut() {
  clickUserMenuItem("Sign out");
}

export function assertSignedIn(username?: string) {
  openUserMenu().contains("Signed in" + (username ? ` as ${username}` : ""));
}

export function assertSignedOut() {
  openUserMenu().should("not.contain", "Signed in");
}
