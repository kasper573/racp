export function openUserMenu() {
  cy.findByTestId("user icon").click();
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

export function findRowById(id: string) {
  return cy.findByRole("row", {
    name: (n, e) => e.getAttribute("data-id") === id,
  });
}

export function gotoMap(id: string) {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Maps").click();
  cy.findByLabelText("ID").type(id);
  findRowById(id).findByRole("link").click();
}

export function gotoMonster(id: number) {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Monsters").click();
  cy.findByLabelText("ID").type(`${id}`);
  findRowById(`${id}`).findByRole("link").click();
}

export function gotoItem(id: number) {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Items").click();
  cy.findByLabelText("ID").type(`${id}`);
  findRowById(`${id}`).findByRole("link").click();
}
