import {
  assertSignedIn,
  assertSignedOut,
  register,
  signIn,
  signOut,
  updateProfile,
} from "../support/actions/user";
import { resetData, signInAsAdmin } from "../support/actions/admin";
import { findMainMenuSection } from "../support/actions/nav";

before(resetData);

beforeEach(() => {
  cy.visit("/");
});

describe("admin", () => {
  beforeEach(signInAsAdmin);
  it("can sign in", () => assertSignedIn());
  it("have access to admin menu once signed in", () => {
    findMainMenuSection("Admin").should("exist");
  });
});

describe("user", () => {
  let user: TestUser;
  beforeEach(() => {
    user = nextTestUser();
    register(user.name, user.password, user.email);
  });

  it("is signed in after registering", () => {
    assertSignedIn(user.name);
  });

  it("can sign in", () => {
    signOut();
    signIn(user.name, user.password);
    assertSignedIn(user.name);
  });

  it("can change their email", () => {
    updateProfile({ email: "new@email.com" });
    signOut();
    cy.visit("/"); // Reload to clear any potential form cache
    signIn(user.name, user.password);
    cy.findByLabelText("Email").should("have.value", "new@email.com");
  });

  it("can change their password", () => {
    updateProfile({ password: "password2" });
    signOut();
    signIn(user.name, "password2");
    assertSignedIn(user.name);
  });

  it("does not have access to admin menu", () => {
    assertSignedIn(user.name);
    findMainMenuSection("Admin").should("not.exist");
  });
});

describe("guest", () => {
  it("does not have access to admin menu", () => {
    findMainMenuSection("Admin").should("not.exist");
  });

  it("is not given access when attempting to sign in with bogus credentials", () => {
    signIn("bogus", "credentials", { waitForRedirect: false });
    assertSignedOut();
  });
});

type TestUser = ReturnType<typeof nextTestUser>;
let testUserCount = 0;
function nextTestUser() {
  const id = testUserCount++;
  return {
    name: "testUser" + id,
    password: "foobar",
    email: `test${id}@users.com`,
  };
}
