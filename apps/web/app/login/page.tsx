"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Field } from "@/components/field";
import { FormBanner } from "@/components/form-banner";
import { AuthShell } from "@/components/auth-shell";
import { ApiError, authApi } from "@/lib/api";
import { validateLogin, type LoginErrors } from "@/lib/auth-validation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function clearError(field: keyof LoginErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateLogin({ email, password });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setFormError(null);
    setSubmitting(true);
    try {
      await authApi.login({ email, password });
      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErrors({
          email: err.fieldErrors.email?.[0],
          password: err.fieldErrors.password?.[0],
        });
      } else {
        setFormError(
          err instanceof ApiError ? err.message : "Something went wrong.",
        );
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Welcome back. Enter your details to continue.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError("email");
          }}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError("password");
          }}
        />
        {formError && <FormBanner>{formError}</FormBanner>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
