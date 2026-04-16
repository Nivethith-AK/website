"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { appwriteAccount } from "@/lib/appwrite";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setMessage("");

    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    const query = new URLSearchParams(window.location.search);
    const userId = query.get("userId") || "";
    const secret = query.get("secret") || "";

    if (!userId || !secret) {
      setStatus("error");
      setMessage("Reset link is invalid or expired. Request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      await appwriteAccount.updateRecovery(userId, secret, password);
      setStatus("success");
      setMessage("Password reset successful. Redirecting to login...");
      window.setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Unable to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-12 pt-32 text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="mx-auto w-full max-w-xl"
      >
        <Card className="lux-glass rounded-3xl p-7 sm:p-10 md:p-12">
          <div className="mb-8 flex items-center justify-between">
            <Badge variant="accent">Password Reset</Badge>
            <Link href="/login" className="text-xs font-black uppercase tracking-[0.28em] text-white/60 hover:text-white">
              Back to Login
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">Create New Password</h1>
            <p className="mt-2 text-xs text-white/65">Set a new secure password for your account.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="reset-password">New Password</FieldLabel>
                <Input
                  id="reset-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="reset-confirm">Confirm Password</FieldLabel>
                <Input
                  id="reset-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </Field>

              {message ? (
                <div
                  className={`rounded-xl px-4 py-3 text-[10px] uppercase tracking-[0.2em] ${
                    status === "success"
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : "border border-red-500/30 bg-red-500/10 text-red-300"
                  }`}
                >
                  {message}
                </div>
              ) : null}

              <Button type="submit" variant="secondary" size="lg" className="w-full rounded-full" isLoading={isLoading}>
                Update Password
              </Button>
            </FieldGroup>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
