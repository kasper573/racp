import {
  gotoItem,
  gotoMap,
  gotoMonster,
  removeUGC,
  signIn,
} from "../support/actions";

describe("after uploading assets", () => {
  before(() => {
    cy.visit("/");
    signIn(Cypress.env("ADMIN_USER"), Cypress.env("ADMIN_PASSWORD"));
    removeUGC();
    uploadAssets();
  });

  describe("map", () => {
    it("exists", () => gotoMap("prontera"));

    it("has pins", () => {
      gotoMap("prontera");
      cy.findAllByTestId("Map pin").should("exist");
    });

    it("has image", () => {
      gotoMap("prontera");
      cy.findByTestId("Map viewport").should("have.css", "background-image");
    });
  });

  describe("monster", () => {
    it("exists", () => gotoMonster(1002));

    it("has image", () => {
      gotoMonster(1002);
      cy.findByRole("img", { name: "Poring" });
    });
  });

  describe("item", () => {
    it("exists", () => gotoItem(501));

    it("has client texts", () => {
      gotoItem(501);

      cy.contains("Red Potion Identified Display Name");
      cy.contains("Red Potion Identified Description");
    });

    it("has image", () => {
      gotoItem(501);
      cy.findByRole("img", { name: "Red Potion" });
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
