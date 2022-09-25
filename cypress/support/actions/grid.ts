export function findRowById(id: string | number) {
  return findDataRows().filter((i, e) => e.getAttribute("data-id") === `${id}`);
}

export function findDataRows() {
  return cy.findAllByRole("row").filter(dataRowSelector);
}

export function findDataCells(
  name: string,
  filter: RegExp | string | number | ((textContent: string) => boolean)
) {
  return cy.findByRole("columnheader", { name }).then((header) => {
    const index = header.index();
    return cy
      .wrap(header.closest(`[role=grid]`))
      .get(`[role=row]${dataRowSelector} [role=cell]:nth-child(${index + 1})`)
      .filter((i, col) => {
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

const dataRowSelector = "[data-id]";
