/**
 * Opens a SliderMenu of the given name and updates its sliders with the new values
 */
export function menuSlide(name: string, newValueOrValues: number | number[]) {
  cy.findByRole("textbox", { name }).click();
  cy.findAllByRole("slider", { name, hidden: true }).slide(newValueOrValues);
  cy.closePoppers();
}

export function waitForPageReady() {
  cy.waitForNetworkIdle(700);
  cy.findByTestId("loading-spinner").should("not.exist");
}

export function unwrap<T>(query: JQuery<T>) {
  const values: T[] = [];
  for (let i = 0; i < query.length; i++) {
    values.push(query.get(i));
  }
  return values;
}
