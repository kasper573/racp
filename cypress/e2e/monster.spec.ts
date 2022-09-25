import {
  findDataColumns,
  findDataRows,
  findRowById,
  findRowsByField,
  listMonsters,
  menuSlide,
  waitForLoadingSpinner,
} from "../support/actions";

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
        findRowsByField("Name", /dopp/i).should("have.length", length);
      });
  });

  it("race", () => {
    cy.get("#Race").select("Angel");
    waitForLoadingSpinner();
    findRowsByField("Name", "Angeling");
  });

  it("element", () => {
    cy.get("#Element").select("Earth");
    waitForLoadingSpinner();
    findRowsByField("Name", "Fabre");
  });

  it("size", () => {
    cy.get("#Size").select("Small");
    waitForLoadingSpinner();
    findRowsByField("Name", "Familiar");
  });

  it("level", () => {
    menuSlide("Level", [50, 55]);
    waitForLoadingSpinner();
    findRowsByField("Level", (level) => +level >= 50 && +level <= 55);
  });

  it("move speed", () => {
    menuSlide("Move Speed", [100, 200]);
    waitForLoadingSpinner();
    findDataColumns("Move Speed").each((col) => {
      cy.wrap(col)
        .invoke("text")
        .then((text) => {
          cy.wrap(parseFloat(text)).shouldBeBetween(100, 200);
        });
    });
  });
});
