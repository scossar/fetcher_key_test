import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getUserByEmail } from "~/models/users";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  let emailExists = false;
  if (email) {
    emailExists = (await getUserByEmail(email)) && true;
  }

  return json({ emailExists: emailExists });
};
