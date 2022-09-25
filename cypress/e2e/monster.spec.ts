import { listMonsters } from "../support/actions/nav";
import {
  findDataCells,
  findDataRows,
  findRowById,
} from "../support/actions/grid";
import { menuSlide, waitForLoadingSpinner } from "../support/actions/common";

beforeEach(() => {
  cy.visit("/");
  listMonsters();
});

describe("can search for monsters by", () => {
  it("id", () => {
    cy.findByLabelText("ID").type("1309");
    waitForLoadingSpinner();
    findRowById(1309);
  });

  it("name", () => {
    cy.findByLabelText("Name").type("dopp");
    waitForLoadingSpinner();
    findDataRows()
      .its("length")
      .then((length) => {
        expect(length).to.be.greaterThan(0, "No monsters found");
        findDataCells("Name", /dopp/i).should("have.length", length);
      });
  });

  it("race", () => {
    cy.get("#Race").select("Angel");
    waitForLoadingSpinner();
    findDataCells("Name", "Angeling");
  });

  it("element", () => {
    cy.get("#Element").select("Earth");
    waitForLoadingSpinner();
    findDataCells("Name", "Fabre");
  });

  it("size", () => {
    cy.get("#Size").select("Small");
    waitForLoadingSpinner();
    findDataCells("Name", "Familiar");
  });

  it("level", () => {
    menuSlide("Level", [50, 55]);
    waitForLoadingSpinner();
    findDataCells("Level", (text) => +text >= 50 && +text <= 55);
  });

  it("move speed", () => {
    menuSlide("Move Speed", [100, 200]);
    waitForLoadingSpinner();
    findDataCells("Move Speed", (text) => +text >= 100 && +text <= 200);
  });
});
