import { unwrap } from "./common";

export function findRowById(id: string | number) {
  return cy.findByRole("row", {
    name: (i, e) => e.getAttribute("data-id") === `${id}`,
    hidden: true,
  });
}

export function findDataRowIds() {
  return cy.findAllByRole("row").then((rows) => {
    const ids = rows.map((i, row) => row.getAttribute("data-id"));
    return unwrap(ids).filter(Boolean);
  });
}

export function findDataCells(
  name: string,
  filter?: RegExp | string | number | ((textContent: string) => boolean)
) {
  return cy.findByRole("columnheader", { name }).then((header) => {
    const index = header.index();
    return cy
      .wrap(header.closest(`[role=grid]`))
      .get(
        `[role=row][${dataRowIdAttribute}] [role=cell]:nth-child(${index + 1})`
      )
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
  cy.findByRole("menuitem", { name: sortMenuItemOptions[type] }).click({
    force: true,
  });
  cy.closePoppers();
}

const sortMenuItemOptions = {
  asc: /Sort by ASC/i,
  desc: /Sort by DESC/i,
  none: /Unsort/i,
};

const dataRowIdAttribute = "data-id";
