/**
 * Opens a SliderMenu of the given name and updates its sliders with the new values
 */
export function menuSlide(name: string, newValueOrValues: number | number[]) {
  cy.findByRole("textbox", { name }).click(); // Open menu
  cy.findAllByRole("slider", { name, hidden: true }).slide(newValueOrValues);
  cy.findByRole("textbox", { name, hidden: true }).click({ force: true }); // Close menu
}

export function unwrap<T>(query: JQuery<T>) {
  const values: T[] = [];
  for (let i = 0; i < query.length; i++) {
    values.push(query.get(i));
  }
  return values;
}
