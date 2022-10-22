describe("example", () => {
  it("can render and observe react component", () => {
    cy.mount(<Example />);
    cy.contains("Hello World");
  });
});

function Example() {
  return <>Hello World</>;
}
