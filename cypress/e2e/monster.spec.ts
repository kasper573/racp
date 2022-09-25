import { listMonsters } from "../support/actions/nav";
import {
  findDataCells,
  findDataRows,
  findRowById,
  sortGridBy,
} from "../support/actions/grid";
import { menuSlide, waitForPageReady } from "../support/actions/common";
import {
  CompareFn,
  compareNumbers,
  createTextCompareFn,
  invertCompareFn,
} from "../support/util";

describe("can search for monsters by", () => {
  beforeEach(() => {
    cy.visit("/");
    listMonsters();
  });

  it("id", () => {
    cy.findByLabelText("ID").type("1309");
    waitForPageReady();
    findRowById(1309);
  });

  it("name", () => {
    cy.findByLabelText("Name").type("dopp");
    waitForPageReady();
    findDataRows()
      .its("length")
      .then((length) => {
        expect(length).to.be.greaterThan(0, "No monsters found");
        findDataCells("Name", /dopp/i).should("have.length", length);
      });
  });

  it("race", () => {
    cy.get("#Race").select("Angel");
    waitForPageReady();
    findDataCells("Name", "Angeling");
  });

  it("element", () => {
    cy.get("#Element").select("Earth");
    waitForPageReady();
    findDataCells("Name", "Fabre");
  });

  it("size", () => {
    cy.get("#Size").select("Small");
    waitForPageReady();
    findDataCells("Name", "Familiar");
  });

  it("level", () => {
    menuSlide("Level", [50, 55]);
    waitForPageReady();
    findDataCells("Level", (text) => +text >= 50 && +text <= 55);
  });

  it("move speed", () => {
    menuSlide("Move Speed", [100, 200]);
    waitForPageReady();
    findDataCells("Move Speed", (text) => +text >= 100 && +text <= 200);
  });

  it("attack range", () => {
    menuSlide("Atk. Range", [5, 10]);
    waitForPageReady();
    findDataCells("Atk. Range", (text) => +text >= 5 && +text <= 10);
  });

  it("skill range", () => {
    menuSlide("Skill Range", [4, 8]);
    waitForPageReady();
    findDataCells("Skill Range", (text) => +text >= 4 && +text <= 8);
  });

  it("chase range", () => {
    menuSlide("Chase Range", [6, 13]);
    waitForPageReady();
    findDataCells("Chase Range", (text) => +text >= 6 && +text <= 13);
  });

  it("base xp", () => {
    cy.findByLabelText("Base XP (min)").type("5000");
    cy.findByLabelText("Base XP (max)").type("6000");
    waitForPageReady();
    findDataCells("Base XP", (text) => +text >= 5000 && +text <= 6000);
  });

  it("job xp", () => {
    cy.findByLabelText("Job XP (min)").type("5000");
    cy.findByLabelText("Job XP (max)").type("6000");
    waitForPageReady();
    findDataCells("Job XP", (text) => +text >= 5000 && +text <= 6000);
  });

  it("modes", () => {
    cy.get("#Modes").select("CastSensorChase");
    waitForPageReady();
    findDataCells("Name", /Archer Guardian/i);
  });
});

describe("can sort monsters by", () => {
  before(() => {
    cy.visit("/");
    listMonsters();
  });

  const compareTexts = createTextCompareFn();
  const columns: Record<string, CompareFn> = {
    Name: compareTexts,
    Level: compareTexts,
    Attack: compareNumbers,
    "M. Attack": compareNumbers,
    Defense: compareNumbers,
    "M. Defense": compareNumbers,
    Hit: compareNumbers,
    Flee: compareNumbers,
    "Base XP": compareNumbers,
    "Job XP": compareNumbers,
    "Move Speed": compareNumbers,
    "Atk. Range": compareNumbers,
    "Skill Range": compareNumbers,
    "Chase Range": compareNumbers,
  };

  Object.entries(columns).forEach(([name, compareFn]) => {
    describe(name, () => {
      it("asc", () => {
        sortGridBy(name, "asc");
        findDataCells(name).shouldBeSortedBy(compareFn);
      });
      it("desc", () => {
        sortGridBy(name, "desc");
        findDataCells(name).shouldBeSortedBy(invertCompareFn(compareFn));
      });
    });
  });
});
