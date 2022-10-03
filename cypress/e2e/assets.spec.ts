import { gotoItem, gotoMap, gotoMonster } from "../support/actions/nav";
import {
  resetData,
  signInAsAdmin,
  uploadAssets,
} from "../support/actions/admin";

before(() => {
  resetData();
  cy.visit("/");
  signInAsAdmin();
  uploadAssets();
});

describe("after uploading assets", () => {
  describe("map", () => {
    before(() => gotoMap("prontera"));

    it("exists", () => cy.contains("Prontera"));

    it("has pins", () => {
      cy.findAllByTestId("Map pin").should("exist");
    });

    it("has image", () => {
      cy.findByRole("img", { name: "Map" }).isFixtureImage("prontera.png");
    });
  });

  describe("monster", () => {
    before(() => gotoMonster(1002));

    it("exists", () => cy.contains("Poring"));

    it("has image", () => {
      cy.findByRole("img", { name: "Poring" }).isFixtureImage("poring.png");
    });
  });

  describe("item", () => {
    before(() => gotoItem(501));

    it("exists", () => cy.contains("Red Potion"));

    it("has client texts", () => {
      cy.contains("Red Potion Identified Display Name");
      cy.contains("Red Potion Identified Description");
    });

    it("has image", () => {
      cy.findByRole("img", { name: "Red Potion" }).isFixtureImage(
        "red_potion.png"
      );
    });
  });
});
