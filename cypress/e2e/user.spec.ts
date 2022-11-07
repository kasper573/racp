import {
  assertSignedIn,
  assertSignedOut,
  register,
  signIn,
  signOut,
  updateProfile,
} from "../support/actions/user";
import { resetData, signInAsAdmin } from "../support/actions/admin";
import { findMainMenuSection, gotoMainMenuPage } from "../support/actions/nav";
import { nextTestUser, TestUser } from "../fixtures/users";
import { generateSearchPageTests } from "../support/actions/search";
import { expectTableColumn, findRowById } from "../support/actions/grid";
import { compareNumeric, compareStrings } from "../support/util";
import { adminAccountId } from "../support/vars";

before(resetData);

describe("guest", () => {
  it("does not have access to admin menu", () => {
    findMainMenuSection("Admin").should("not.exist");
  });

  it("is not given access when attempting to sign in with bogus credentials", () => {
    signIn("bogus", "credentials", { waitForRedirect: false });
    assertSignedOut();
  });
});

describe("user", () => {
  let user: TestUser;
  beforeEach(() => {
    cy.visit("/");
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

describe("admin", () => {
  beforeEach(() => {
    cy.visit("/");
    signInAsAdmin();
  });
  it("can sign in", () => assertSignedIn());
  it("have access to admin menu once signed in", () => {
    findMainMenuSection("Admin").should("exist");
  });
});

describe("admin user search", () => {
  let user: TestUser;
  before(() => {
    cy.visit("/");
    user = nextTestUser();
    register(user.name, user.password, user.email);
    signOut();
    signInAsAdmin();
    gotoMainMenuPage("Users");
  });
  generateSearchPageTests({
    /**
     * Disable pagination tests since registering enough users to activate
     * pagination is not worth the CI test runtime. We're testing pagination enough in other suites anyway,
     * so it's fairly safe to assume it works here as well.
     */
    pagination: false,
    searches: {
      Id: {
        input: (menu) => menu().findByLabelText("ID").type(`${adminAccountId}`),
        verify: () => findRowById(adminAccountId),
      },
      Name: {
        input: (menu) => menu().findByLabelText("Name").type(user.name),
        verify: () => expectTableColumn("Name", () => user.name),
      },
      Email: {
        input: (menu) => menu().findByLabelText("Email").type(user.email),
        verify: () => expectTableColumn("Email", () => user.email),
      },
    },
    sorts: {
      Id: compareNumeric,
      Name: compareStrings,
      Email: compareStrings,
    },
  });
});
