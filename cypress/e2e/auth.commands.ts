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
