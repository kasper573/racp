export function openUserMenu() {
  cy.findByRole("button", { name: "Open user menu" }).click();
  return cy.findByTestId("user menu");
}

export function register(username: string, password: string, email: string) {
  openUserMenu().findByRole("link", { name: "Register" }).click();

  cy.findByLabelText("Username").type(username);
  cy.findByLabelText("Email").type(email);
  cy.findByLabelText("Password").type(password);
  cy.findByLabelText("Password (confirm)").type(password);
  cy.findByRole("button", { name: "Register" }).click();
}

export function signIn(username: string, password: string) {
  openUserMenu().findByRole("link", { name: "Sign in" }).click();

  cy.findByLabelText("Username").type(username);
  cy.findByLabelText("Password").type(password);
  cy.findByRole("button", { name: "Sign in" }).click();
}

export function signOut() {
  openUserMenu().findByRole("menuitem", { name: "Sign out" }).click();
}

export function assertSignedIn(username?: string) {
  openUserMenu().contains("Signed in" + (username ? ` as ${username}` : ""));
}
