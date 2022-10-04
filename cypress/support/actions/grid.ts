import { unwrap } from "./common";

export function findRowById(id: string | number) {
  return cy.findByRole("row", {
    name: (i, e) => e.getAttribute(idAttribute) === `${id}`,
    hidden: true,
  });
}

export type TableCellMatcher =
  | RegExp
  | string
  | number
  | ((textContent: string) => boolean);
export type TableRowMatcher = TableCellMatcher[];

export function expectTableData(
  matchers:
    | TableRowMatcher[]
    | ((rowIndex: number) => TableRowMatcher | undefined)
) {
  const getRowMatcher = Array.isArray(matchers)
    ? (rowIndex: number) => matchers[rowIndex]
    : matchers;
  return cy
    .findAllByRole("row", { name: (i, row) => row.hasAttribute(idAttribute) })
    .each((row) => {
      return cy
        .wrap(row)
        .findAllByRole("cell", {
          name: (i, row) => row.hasAttribute(fieldAttribute),
        })
        .each((cell) => {
          const rowMatcher = getRowMatcher(row.index());
          const cellMatcher = rowMatcher?.[cell.index()];
          if (typeof cellMatcher === "function") {
            cy.wrap(cell).should((cell) => cellMatcher(cell.text()));
          } else if (cellMatcher instanceof RegExp) {
            cy.wrap(cell).contains(cellMatcher);
          } else if (cellMatcher !== undefined) {
            cy.wrap(cell).should("have.text", cellMatcher);
          }
        });
    });
}

export function expectTableColumn(
  columnName: string,
  getCellMatcher: (rowIndex: number) => TableCellMatcher | undefined
) {
  return cy
    .findByRole("columnheader", { name: columnName })
    .invoke("index")
    .then((index) => {
      expectTableData((rowIndex) => {
        const rowMatcher: TableRowMatcher = [];
        const cellMatcher = getCellMatcher(rowIndex);
        if (cellMatcher !== undefined) {
          rowMatcher[index] = cellMatcher;
        }
        return rowMatcher;
      });
    });
}

export function findTableColumn(name: string) {
  return cy.findByRole("columnheader", { name }).then((header) => {
    const fieldName = header.attr(fieldAttribute);
    return cy.findAllByRole("cell", {
      hidden: true,
      name: (i, cell) => cell.getAttribute(fieldAttribute) === fieldName,
    });
  });
}

export function findDataRowIds() {
  return cy.findAllByRole("row").then((rows) => {
    const ids = rows.map((i, row) => row.getAttribute(idAttribute));
    return unwrap(ids).filter(Boolean);
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

const idAttribute = "data-id";
const fieldAttribute = "data-field";
