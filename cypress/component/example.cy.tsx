describe("example component test", () => {
  it("works", () => {
    cy.mount(<Example />);
    cy.contains("Hello World");
  });
});

function Example() {
  return <>Hello World</>;
}
