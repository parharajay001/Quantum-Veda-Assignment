"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Field } from "@/components/field";
import { FormBanner } from "@/components/form-banner";
import { AuthShell } from "@/components/auth-shell";
import { ApiError, authApi } from "@/lib/api";
import { validateRegister, type RegisterErrors } from "@/lib/auth-validation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function clearError(field: keyof RegisterErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateRegister({ name, email, password });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setFormError(null);
    setSubmitting(true);
    try {
      await authApi.register({ name, email, password });
      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErrors({
          name: err.fieldErrors.name?.[0],
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
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start organizing your team&apos;s work.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          id="name"
          label="Name"
          type="text"
          autoComplete="name"
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            clearError("name");
          }}
        />
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
          autoComplete="new-password"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError("password");
          }}
        />
        {formError && <FormBanner>{formError}</FormBanner>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
