export function testItemIdentifier(
  findIdentifier: () => Cypress.Chainable,
  {
    name,
    cards,
    slots,
    enchants,
  }: { name: string; slots: number; cards: string[]; enchants: string[] }
) {
  describe("item identifier", () => {
    it("has cards and enchants summarized in display name", () => {
      findIdentifier().should(
        "have.text",
        `${name} [${cards.length}/${slots}] [${enchants.length} ea]`
      );
    });

    it("has cards detailed in tooltip", () => {
      findIdentifier().trigger("mouseover");
      cy.findByLabelText("Item tooltip").within(() => {
        cy.wrap(cards).each((card: string) => {
          cy.findByText(card).should("exist");
        });
      });
    });

    it("has enchants detailed in tooltip", () => {
      findIdentifier().trigger("mouseover");
      cy.findByLabelText("Item tooltip").within(() => {
        cy.wrap(enchants).each((enchant: string) => {
          cy.findByText(enchant).should("exist");
        });
      });
    });
  });
}
