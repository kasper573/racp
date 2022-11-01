export type TestUser = ReturnType<typeof nextTestUser>;
let testUserCount = 0;

export function nextTestUser() {
  const id = testUserCount++;
  return {
    name: "testUser" + id,
    password: "foobar",
    email: `test${id}@users.com`,
  };
}
