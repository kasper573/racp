/**
 * Opens a SliderMenu of the given name and updates its sliders with the new values
 */
export function menuSlide(name: string, newValueOrValues: number | number[]) {
  cy.findByRole("textbox", { name }).click(); // Open menu
  cy.findAllByRole("slider", { name, hidden: true }).slide(newValueOrValues);
  cy.findByRole("textbox", { name, hidden: true }).click({ force: true }); // Close menu
}

export function waitForPageReady(
  // Long default timeout because a lot of e2e tests involve admin operations
  // which cause the API to rebuild cache, which may take a while.
  timeout = 60000
) {
  cy.waitForNetworkIdle(200); // Make sure page has been loaded

  // Page is ready when no loading spinner has been visible for 1 second
  cy.get("body").then(($body) =>
    cy.shouldFor(
      () => $body.find(`[data-testid="loading-spinner"]`).length === 0,
      1000,
      { timeout, name: "No loading spinner" }
    )
  );
}

export function unwrap<T>(query: JQuery<T>) {
  const values: T[] = [];
  for (let i = 0; i < query.length; i++) {
    values.push(query.get(i));
  }
  return values;
}
