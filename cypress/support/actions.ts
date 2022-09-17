export function signIn(username: string, password: string) {
  cy.findByRole("banner").within(() =>
    cy.findByTestId("AccountCircleIcon").click()
  );

  cy.findByRole("link", { name: "Sign in" }).click();
  cy.findByLabelText("Username").type(username);
  cy.findByLabelText("Password").type(password);
  cy.findByRole("button", { name: "Sign in" }).click();
}

export function assertSignedIn() {
  cy.findByTestId("online-badge").should("exist");
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

export function removeUGC() {
  cy.exec("yarn run remove-ugc");
}
