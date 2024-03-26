let users = [
  {
    id: 1,
    email: "bob@example.com",
    username: "bob",
    password: "simplepass",
  },
  {
    id: 2,
    email: "sally@example.com",
    username: "sally",
    password: "simplepass",
  },
  {
    id: 3,
    email: "foo@example.com",
    username: "foo",
    password: "simplepass",
  },
];

export const getUserByEmail = async (email: string) => {
  const user = users.find((u) => u.email === email);
  return user ? user : false;
};

export const getUserByUsername = async (username: string) => {
  const user = users.find((u) => u.username === username);
  return user ? user : false;
};
