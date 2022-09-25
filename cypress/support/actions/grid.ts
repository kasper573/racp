export function findRowById(id: string | number) {
  return findDataRows().filter((i, e) => e.getAttribute("data-id") === `${id}`);
}

export function findDataRows() {
  return cy.findAllByRole("row").filter(dataRowSelector);
}

export function findDataCells(
  name: string,
  filter?: RegExp | string | number | ((textContent: string) => boolean)
) {
  return cy.findByRole("columnheader", { name }).then((header) => {
    const index = header.index();
    return cy
      .wrap(header.closest(`[role=grid]`))
      .get(`[role=row]${dataRowSelector} [role=cell]:nth-child(${index + 1})`)
      .filter((i, col) => {
        if (filter === undefined) {
          return true;
        }
        const textContent = col.textContent ?? "";
        if (typeof filter === "function") {
          return filter(textContent);
        }
        if (filter instanceof RegExp) {
          return filter.test(textContent);
        }
        return textContent === `${filter}`;
      });
  });
}

export function sortGridBy(
  name: string,
  type: keyof typeof sortMenuItemOptions
) {
  cy.findByRole("columnheader", { name }).within(() => {
    return cy.get(`button[aria-label="Menu"]`).click({ force: true });
  });
  cy.findByRole("menuitem", { name: sortMenuItemOptions[type] }).click();
  cy.closePoppers();
}

const sortMenuItemOptions = {
  asc: /Sort by ASC/i,
  desc: /Sort by DESC/i,
  none: /Unsort/i,
};

const dataRowSelector = "[data-id]";
