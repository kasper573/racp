import { resetData, signInAsAdmin } from "../support/actions/admin";
import { clickMainMenuItem } from "../support/actions/nav";

before(() => {
  resetData();
  cy.visit("/");
  signInAsAdmin();
});

describe("can change settings", () => {
  beforeEach(() => clickMainMenuItem("Settings", { menuName: "Admin" }));
  it("page title", () => {
    cy.findByLabelText("Page Title").clear().type("Test Title");
    cy.findByRole("heading", { name: "Test Title" });
  });
});
