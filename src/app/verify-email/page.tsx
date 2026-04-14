"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

function VerifyEmailContent() {
  const params = useSearchParams();

  const token_hash = params.get("token_hash");
  const type = params.get("type") || "signup";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      if (!token_hash) {
        setStatus("error");
        setMessage("Verification token is missing. Please use the latest email link.");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      });

      if (error) {
        setStatus("error");
        setMessage(error.message || "Email verification failed.");
      } else {
        setStatus("success");
        setMessage("Email verified successfully. Wait for admin approval.");
      }
    };

    verify();
  }, [token_hash, type]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <Card className="p-6 text-center max-w-md">
        <Badge>
          {status === "loading"
            ? "Processing"
            : status === "success"
            ? "Verified"
            : "Error"}
        </Badge>

        <h1 className="text-xl font-bold mt-4">Email Verification</h1>

        <p className="mt-2 text-sm opacity-70">{message}</p>

        <Link href="/login">
          <Button className="mt-4">Go to Login</Button>
        </Link>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}