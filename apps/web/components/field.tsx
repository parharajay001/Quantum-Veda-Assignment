"use client";

import * as React from "react";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { cn } from "@repo/ui/lib/utils";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

// A labelled input with an inline validation message. The error is associated to
// the input via aria-describedby and the input is marked aria-invalid so screen
// readers announce it; the visible message turns the border destructive.
export function Field({ id, label, error, className, ...props }: FieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          error &&
            "border-destructive focus-visible:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
