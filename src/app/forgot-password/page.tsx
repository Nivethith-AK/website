"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { appwriteAccount } from "@/lib/appwrite";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      setError("Enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await appwriteAccount.createRecovery(normalized, `${window.location.origin}/reset-password`);
      setSuccess("Reset link sent. Check your email inbox.");
    } catch (err: any) {
      setError(err?.message || "Unable to send reset link");
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
            <Badge variant="accent">Password Recovery</Badge>
            <Link href="/login" className="text-xs font-black uppercase tracking-[0.28em] text-white/60 hover:text-white">
              Back to Login
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">Forgot Password</h1>
            <p className="mt-2 text-xs text-white/65">Enter your email and we will send a reset link.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.com"
                  disabled={isLoading}
                  required
                />
              </Field>

              {error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-red-300">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                  {success}
                </div>
              ) : null}

              <Button type="submit" variant="secondary" size="lg" className="w-full rounded-full" isLoading={isLoading}>
                Send Reset Link
              </Button>
            </FieldGroup>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
