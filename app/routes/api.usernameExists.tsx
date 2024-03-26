import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getUserByUsername } from "~/models/users";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");
  let usernameExists = false;
  if (username) {
    usernameExists = (await getUserByUsername(username)) && true;
  }

  return json({ usernameExists: usernameExists });
};
