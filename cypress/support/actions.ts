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

export function findRowById(id: string | number) {
  return cy.findByRole("row", {
    name: (n, e) => e.getAttribute("data-id") === `${id}`,
  });
}

export function findRowsByField(
  fieldName: string,
  fieldValue: RegExp | string | number
) {
  return cy.findAllByRole("row", {
    name: (n, row) => {
      const columns = Array.from(row.children);
      const match = columns.find((col) => {
        if (col.getAttribute("data-field") !== fieldName) {
          return false;
        }
        const value = col.textContent ?? "";
        return fieldValue instanceof RegExp
          ? fieldValue.test(value)
          : value === `${fieldValue}`;
      });
      return !!match;
    },
  });
}

export function countRows() {
  return cy
    .findAllByRole("row", { name: (n, row) => row.hasAttribute("data-id") })
    .its("length");
}

export function listMaps() {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Maps").click();
}

export function gotoMap(id: string) {
  listMaps();
  cy.findByLabelText("ID").type(id);
  findRowById(id).findByRole("link").click();
}

export function listMonsters() {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Monsters").click();
}

export function gotoMonster(id: number) {
  listMonsters();
  cy.findByLabelText("ID").type(`${id}`);
  findRowById(`${id}`).findByRole("link").click();
}

export function listItems() {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Items").click();
}

export function gotoItem(id: number) {
  listItems();
  cy.findByLabelText("ID").type(`${id}`);
  findRowById(`${id}`).findByRole("link").click();
}
