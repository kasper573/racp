export function testItemIdentifier(
  findIdentifier: () => Cypress.Chainable,
  {
    name,
    cards,
    slots,
    refine,
    enchants,
  }: {
    refine: number;
    name: string;
    slots: number;
    cards: string[];
    enchants: string[];
  }
) {
  describe("item identifier", () => {
    it("has cards and enchants summarized in display name", () => {
      findIdentifier().should(
        "have.text",
        `${refine ? `+${refine} ` : ""}${name} [${cards.length}/${slots}] [${
          enchants.length
        } ea]`
      );
    });

    it("has cards detailed in tooltip", () => {
      findIdentifier().trigger("mouseover");
      cy.findByLabelText("Item tooltip").within(() => {
        cy.wrap(cards).each((card: string) => {
          cy.contains(card);
        });
      });
    });

    it("has enchants detailed in tooltip", () => {
      findIdentifier().trigger("mouseover");
      cy.findByLabelText("Item tooltip").within(() => {
        cy.wrap(enchants).each((enchant: string) => {
          cy.contains(enchant);
        });
      });
    });
  });
}
