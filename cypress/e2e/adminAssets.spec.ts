import { gotoItem, gotoMap, gotoMonster, signIn } from "../support/actions";

describe("after uploading assets", () => {
  before(() => {
    cy.visit("/");
    signIn(Cypress.env("ADMIN_USER"), Cypress.env("ADMIN_PASSWORD"));
    //removeUGC();
    uploadAssets();
  });

  describe("map", () => {
    before(() => gotoMap("prontera"));

    it("exists", () => cy.contains("Prontera"));

    it("has pins", () => {
      cy.findAllByTestId("Map pin").should("exist");
    });

    it("has image", () => {
      cy.findByTestId("Map viewport").isFixtureImage("prontera.png");
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

function uploadAssets() {
  const fixtures = Cypress.config("fixturesFolder");
  cy.findByRole("menu", { name: "Admin" }).findByText("Assets").click();
  cy.selectFileByName("mapInfo", `${fixtures}/mapInfo_prontera.lub`);
  cy.selectFileByName("itemInfo", `${fixtures}/itemInfo_red-potion.lub`);
  cy.selectFileByName("data", `${fixtures}/prontera_poring_red-potion.grf`);
  cy.findByRole("button", { name: "Upload" }).click();
}
