"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-28 text-foreground">
      <div className="mx-auto max-w-xl">
        <Card className="lux-glass rounded-3xl p-8 text-center">
          <Badge variant="accent">Account Setup</Badge>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-tight">Email Verification</h1>
          <p className="mt-3 text-sm text-white/70">
            Appwrite email verification flow is handled by your project settings. After verification, return and sign in.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login">
              <Button variant="secondary">Go to Login</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
