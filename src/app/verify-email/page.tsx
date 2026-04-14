"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { assertSupabaseConfig } from "@/lib/supabase";

function VerifyEmailContent() {
  const params = useSearchParams();

  // ✅ IMPORTANT: must match ?token= from email link
  const token = params.get("token");

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      // ❌ No token in URL
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification token.");
        return;
      }

      try {
        assertSupabaseConfig();
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Supabase not configured.");
        return;
      }

      try {
        // ✅ SUPABASE EMAIL CONFIRMATION
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "signup",
        });

        if (error) {
          setStatus("error");
          setMessage(error.message || "Email verification failed.");
          return;
        }

        setStatus("success");
        setMessage(
          "Email verified successfully. You can now login and wait for admin approval."
        );
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Unexpected error occurred.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-background px-4 py-28 text-foreground">
      <div className="mx-auto max-w-xl">
        <Card className="lux-glass rounded-3xl p-8 text-center">
          <Badge
            variant={
              status === "success"
                ? "success"
                : status === "error"
                ? "warning"
                : "accent"
            }
          >
            {status === "loading"
              ? "Processing"
              : status === "success"
              ? "Verified"
              : "Error"}
          </Badge>

          <h1 className="mt-4 text-3xl font-black uppercase tracking-tight">
            Email Verification
          </h1>

          <p className="mt-3 text-sm text-white/70">{message}</p>

          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login">
              <Button variant="secondary">Go to Login</Button>
            </Link>

            {status === "error" && (
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background px-4 py-28 text-center text-white/70">
          Loading...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}