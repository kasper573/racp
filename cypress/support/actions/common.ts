/**
 * Opens a SliderMenu of the given name and updates its sliders with the new values
 */
export function menuSlide(name: string, newValueOrValues: number | number[]) {
  cy.findByRole("textbox", { name }).click(); // Open menu
  cy.findAllByRole("slider", { name, hidden: true }).slide(newValueOrValues);
  cy.findByRole("textbox", { name, hidden: true }).click({ force: true }); // Close menu
}

export function waitForPageReady() {
  // Wait time is arbitrary, but enough to safely assume network is idle
  cy.waitForNetworkIdle(200);
  // Long wait time is because a lot of e2e tests involve admin operations
  // which cause the API to rebuild cache, which may take a while.
  // It's a bit ugly, but it works great.
  cy.findByTestId("loading-spinner", { timeout: 60000 }).should("not.exist");
}

export function followLink(name?: string | RegExp) {
  cy.findByRole("link", { name }).click();
  waitForPageReady();
}

export function unwrap<T>(query: JQuery<T>) {
  const values: T[] = [];
  for (let i = 0; i < query.length; i++) {
    values.push(query.get(i));
  }
  return values;
}
