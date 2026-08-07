"use client";

import Link from "next/link";
import {
  ArrowRight,
  LockKeyhole,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import {
  useState,
} from "react";

export function AuthForm({
  mode,
}: {
  mode:
    | "login"
    | "signup";
}) {
  const router =
    useRouter();
  const [
    email,
    setEmail,
  ] = useState("");
  const [
    displayName,
    setDisplayName,
  ] = useState("");
  const [
    password,
    setPassword,
  ] = useState("");
  const [
    error,
    setError,
  ] = useState("");
  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  async function submit(
    event:
      React.FormEvent,
  ) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/auth/${mode}`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
              displayName,
              password,
            }),
          },
        );
      const result =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Authentication failed.",
        );
      }

      router.push(
        "/account",
      );
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Authentication failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="auth-icon">
          <LockKeyhole
            size={22}
          />
        </span>
        <p className="layer3-kicker">
          OLFACTUS Account
        </p>
        <h1 className="display-serif">
          {mode === "signup"
            ? "Create your private scent intelligence account."
            : "Return to your synchronized collection."}
        </h1>
        <p className="auth-subtitle">
          Your collection remains private by default. Existing browser data can be uploaded after sign-in.
        </p>

        <form
          onSubmit={submit}
          className="auth-form"
        >
          {mode ===
          "signup" ? (
            <label>
              <span>
                Display name
              </span>
              <input
                required
                value={
                  displayName
                }
                onChange={(
                  event,
                ) =>
                  setDisplayName(
                    event.target
                      .value,
                  )
                }
              />
            </label>
          ) : null}

          <label>
            <span>
              Email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target
                    .value,
                )
              }
            />
          </label>

          <label>
            <span>
              Password
            </span>
            <input
              required
              type="password"
              minLength={10}
              value={password}
              onChange={(
                event,
              ) =>
                setPassword(
                  event.target
                    .value,
                )
              }
            />
          </label>

          {error ? (
            <p className="auth-error">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={
              submitting
            }
          >
            {submitting
              ? "Please wait"
              : mode ===
                  "signup"
                ? "Create account"
                : "Sign in"}
            <ArrowRight
              size={15}
            />
          </button>
        </form>

        <p className="auth-switch">
          {mode ===
          "signup"
            ? "Already have an account?"
            : "Need an account?"}{" "}
          <Link
            href={
              mode ===
              "signup"
                ? "/login"
                : "/signup"
            }
          >
            {mode ===
            "signup"
              ? "Sign in"
              : "Create one"}
          </Link>
        </p>
      </section>
    </main>
  );
}
