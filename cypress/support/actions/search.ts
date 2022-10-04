import { without } from "lodash";
import { CompareFn, invertCompareFn } from "../util";
import { waitForPageReady } from "./common";
import { findDataRowIds, findTableColumn, sortGridBy } from "./grid";

const clearFilters = () => cy.findByRole("button", { name: /clear/i }).click();

export const withFilterMenu = (fn: () => void) => {
  cy.findByRole("button", { name: /show filters/i }).click();
  fn();
  cy.findByRole("button", { name: /close/i }).click();
};

export function generateSearchPageTests({
  searches,
  sorts,
}: {
  searches: Record<string, { input: Function; verify: Function }>;
  sorts: Record<string, CompareFn>;
}) {
  // Lazy test: doesn't test all possible pagination options.
  // This test assumes that the implementation uses a generic solution
  // and that if one pagination option works, they all work.
  it("can paginate", () => {
    findDataRowIds().then((idsBeforePagination) => {
      cy.findByRole("button", { name: "Go to next page" }).click();
      waitForPageReady();
      findDataRowIds().then((idsAfterPagination) => {
        const newIds = without(idsAfterPagination, ...idsBeforePagination);
        expect(newIds).to.deep.equal(
          idsAfterPagination,
          "Next page should only have new rows"
        );

        // Reset to the first page before searching and filtering
        cy.findByRole("button", { name: "Go to previous page" }).click();
      });
    });
  });

  describe("can search by", () => {
    Object.entries(searches).forEach(([name, { input, verify }]) => {
      it(name, () => {
        withFilterMenu(() => {
          clearFilters();
          input();
        });
        waitForPageReady();
        verify();
      });
    });
  });

  describe("can sort by", () => {
    before(() => withFilterMenu(clearFilters));

    Object.entries(sorts).forEach(([name, compareFn]) => {
      describe(name, () => {
        it("asc", () => {
          sortGridBy(name, "asc");
          waitForPageReady();
          findTableColumn(name).shouldBeSortedBy(compareFn);
        });
        it("desc", () => {
          sortGridBy(name, "desc");
          waitForPageReady();
          findTableColumn(name).shouldBeSortedBy(invertCompareFn(compareFn));
        });
      });
    });
  });
}