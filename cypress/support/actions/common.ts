/**
 * Opens a SliderMenu of the given name and updates its sliders with the new values
 */
export function menuSlide(name: string, newValueOrValues: number | number[]) {
  cy.findByRole("textbox", { name }).click(); // Open menu
  cy.findAllByRole("slider", { name, hidden: true }).slide(newValueOrValues);
  cy.findByRole("textbox", { name, hidden: true }).click({ force: true }); // Close menu
}

export function waitForPageReady() {
  // Wait time is arbitrary, but enough to safely assume page has finished loading initial resources.
  cy.waitForNetworkIdle(200);
  cy.findByTestId("loading-spinner").should("not.exist");
}

export function waitForApiReady() {
  // Wait time is arbitrary, but enough to safely assume API has finished (re)loading resources.
  cy.trpc((client) => client?.util.ready.query(), { timeout: 60000 });
}

export function unwrap<T>(query: JQuery<T>) {
  const values: T[] = [];
  for (let i = 0; i < query.length; i++) {
    values.push(query.get(i));
  }
  return values;
}
