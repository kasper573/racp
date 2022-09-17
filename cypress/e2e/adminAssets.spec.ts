import { gotoMap, signIn } from "../support/actions";

beforeEach(() => {
  cy.visit("/");
});

describe("admin", () => {
  beforeEach(() =>
    signIn(Cypress.env("ADMIN_USER"), Cypress.env("ADMIN_PASSWORD"))
  );

  describe("after uploading assets", () => {
    beforeEach(() => {
      //removeUGC();
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
