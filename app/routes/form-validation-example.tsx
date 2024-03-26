import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useFetcher } from "@remix-run/react";
import { useState } from "react";

import { getUserByEmail, getUserByUsername } from "~/models/users";
import debounce from "~/utilities/debounce";

interface FormValidationFetcher {
  emailExists?: boolean | null;
  usernameExists?: boolean | null;
}

const validateEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};

const emailAvailable = (email: string) => {
  return !getUserByEmail(email);
};

const usernameAvailable = (username: string) => {
  return !getUserByUsername(username);
};

const validateUsername = (username: string) => {
  return username.length >= 3;
};

const validatePassword = (password: string) => {
  return password.length >= 8;
};

type FormErrors = {
  emailValid?: string;
  emailAvailable?: string;
  usernameValid?: string;
  usernameAvailable?: string;
  passwordValid?: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));

  const errors: FormErrors = {};

  if (!validateEmail(email)) {
    errors.emailValid = "Invalid email address";
  }

  if (!validateUsername(username)) {
    errors.usernameValid = "Invalid username";
  }

  if (!validatePassword(password)) {
    errors.passwordValid = "Invalid password";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }
  // Call Register function, then:

  return redirect("/");
};

export default function formValidationExample() {
  const actionData = useActionData<typeof action>();
  const emailFetcher = useFetcher<FormValidationFetcher>({
    key: "user-by-email",
  });
  const usernameFetcher = useFetcher<FormValidationFetcher>({
    key: "user-by-username",
  });
  const [passwordValid, setPasswordValid] = useState<boolean | undefined>();

  let emailAvailable: boolean | undefined,
    usernameAvailable: boolean | undefined,
    submitDisabled = true;
  if (emailFetcher && emailFetcher?.data) {
    emailAvailable = emailFetcher?.data?.emailExists ? false : true;
  }
  if (usernameFetcher && usernameFetcher?.data) {
    usernameAvailable = usernameFetcher.data?.usernameExists ? false : true;
  }

  const debouncedEmailAvailablityCheck = debounce((email: string) => {
    emailFetcher.load(`/api/emailExists?email=${email}`);
  }, 500);

  const handleEmailInput = (event: React.FormEvent<HTMLInputElement>) => {
    const email = event.currentTarget.value;
    if (validateEmail(email)) {
      debouncedEmailAvailablityCheck(email);
    }
  };

  const debouncedUsernameAvailablityCheck = debounce((username: string) => {
    usernameFetcher.load(`/api/usernameExists?username=${username}`);
  }, 500);

  const handleUsernameInput = (event: React.FormEvent<HTMLInputElement>) => {
    const username = event.currentTarget.value;
    if (username.length >= 3) {
      debouncedUsernameAvailablityCheck(username);
    }
  };

  const handlePasswordInput = (event: React.FormEvent<HTMLInputElement>) => {
    const password = event.currentTarget.value;
    let valid: boolean;
    valid = password.length >= 8;
    setPasswordValid(valid);
  };

  if (
    emailFetcher.data &&
    !emailFetcher.data.emailExists &&
    usernameFetcher.data &&
    !usernameFetcher.data.usernameExists &&
    passwordValid
  ) {
    submitDisabled = false;
  }

  return (
    <div className="mx-auto w-60 my-12">
      <Form method="post">
        <p className="mb-3">
          <label htmlFor="email">Email</label>
          <input
            className="px-1 border border-slate-500 rounded-sm text-cyan-900"
            type="email"
            name="email"
            required={true}
            maxLength={255}
            onInput={handleEmailInput}
          />
          {actionData?.errors?.emailValid && (
            <em>{actionData.errors.emailValid}</em>
          )}
          {emailAvailable !== undefined && !emailAvailable && (
            <em>Email address taken</em>
          )}
        </p>
        <p className="mb-3">
          <label htmlFor="username">Username</label>
          <input
            className="px-1 border border-slate-500 rounded-sm text-cyan-900"
            type="text"
            name="username"
            required={true}
            minLength={3}
            onInput={handleUsernameInput}
          />
          {actionData?.errors?.usernameValid && (
            <em>{actionData.errors.usernameValid}</em>
          )}
          {usernameAvailable !== undefined && !usernameAvailable && (
            <em>Username taken</em>
          )}
        </p>
        <p className="mb-3">
          <label htmlFor="password">Password</label>
          <input
            className="px-1 border border-slate-500 rounded-sm text-cyan-900"
            type="password"
            name="password"
            required={true}
            minLength={8}
            onInput={handlePasswordInput}
          />
          {actionData?.errors?.passwordValid && (
            <em>{actionData.errors.passwordValid}</em>
          )}
          {passwordValid !== undefined && !passwordValid && (
            <em>Password must be at least 8 characters</em>
          )}
        </p>
        <button
          className={`px-2 py-1 rounded-sm text-slate-900 ${
            submitDisabled
              ? "bg-slate-400 cursor-default"
              : "bg-slate-50 cursor-pointer"
          }`}
          type="submit"
          disabled={submitDisabled}
        >
          Sign Up
        </button>
      </Form>
    </div>
  );
}
