import { waitForPageReady } from "./actions/common";
import { findDataCells, sortGridBy } from "./actions/grid";

export function generateSearchPageTests({
  gotoPage,
  searches,
  sorts,
}: {
  gotoPage: Function;
  searches: Record<string, { input: Function; verify: Function }>;
  sorts: Record<string, CompareFn>;
}) {
  describe("can search by", () => {
    // Reload page before each search to reset search filter
    beforeEach(() => {
      cy.visit("/");
      gotoPage();
    });

    Object.entries(searches).forEach(([name, { input, verify }]) => {
      it(name, () => {
        input();
        waitForPageReady();
        verify();
      });
    });
  });
  describe("can filter by", () => {
    // Only a single page load is necessary since we can only have one sort active
    before(() => {
      cy.visit("/");
      gotoPage();
    });

    Object.entries(sorts).forEach(([name, compareFn]) => {
      describe(name, () => {
        it("asc", () => {
          sortGridBy(name, "asc");
          waitForPageReady();
          findDataCells(name).shouldBeSortedBy(compareFn);
        });
        it("desc", () => {
          sortGridBy(name, "desc");
          waitForPageReady();
          findDataCells(name).shouldBeSortedBy(invertCompareFn(compareFn));
        });
      });
    });
  });
}

export function createTextCompareFn(caseSensitive = true): CompareFn<string> {
  return (a, b) => {
    if (!caseSensitive) {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    return a.localeCompare(b);
  };
}

export const compareNumeric: CompareFn<string> = (a, b) => {
  const aNum = isNumeric(a) ? parseInt(a) : undefined;
  const bNum = isNumeric(b) ? parseInt(b) : undefined;
  if (aNum === bNum) {
    return 0;
  }
  if (aNum === undefined) {
    return 1;
  }
  if (bNum === undefined) {
    return -1;
  }
  return aNum - bNum;
};

const isNumeric = (value: string) => {
  return /^\d+$/.test(value);
};

export function invertCompareFn<T>(compareFn: CompareFn<T>): CompareFn<T> {
  return (a: T, b: T) => compareFn(b, a);
}

export type CompareFn<T = any> = (a: T, b: T) => number;
