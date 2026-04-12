"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { post } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    if (password.length < 5) {
      setError("Password must be at least 5 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await post("/auth/login", { email, password });

      if (response.success && response.token && response.user) {
        localStorage.setItem("token", response.token);
        const role = response.user.role;
        if (role === "admin") router.push("/admin/dashboard");
        else if (role === "designer") router.push("/designer/dashboard");
        else if (role === "company") router.push("/client/dashboard");
        else router.push("/");
      } else {
        setError(response.message || "Invalid email or password");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-12 pt-32 text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 28, -15, 0], y: [0, -25, 18, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-10%] top-[2%] h-[34rem] w-[34rem] rounded-full bg-accent-purple/24 blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, -20, 16, 0], y: [0, 24, -16, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-12%] right-[-8%] h-[30rem] w-[30rem] rounded-full bg-accent/10 blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="mx-auto w-full max-w-xl"
      >
        <Card className="lux-glass rounded-3xl p-7 sm:p-10 md:p-12">
          <div className="mb-8 flex items-center justify-between">
            <Badge variant="accent">Member Access</Badge>
            <Link href="/" className="text-xs font-black uppercase tracking-[0.28em] text-white/60 hover:text-white">
              Home
            </Link>
          </div>

          <div className="mb-10 text-center">
            <Link href="/" className="mb-6 inline-block">
              <div className="text-2xl sm:text-3xl font-black tracking-[0.35em] uppercase">
                AURA<span className="text-accent">X</span>
              </div>
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">Sign In</h1>
            <p className="mt-2 text-[10px] uppercase tracking-[0.32em] text-white/55">Secure identity validation</p>
          </div>

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.com"
                  disabled={isLoading}
                  required
                  className="normal-case tracking-normal"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  disabled={isLoading}
                  required
                  className="normal-case tracking-normal"
                />
                <FieldDescription>Minimum 5 characters</FieldDescription>
              </Field>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-red-300"
                >
                  {error}
                </motion.div>
              )}

              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.995 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="secondary"
                  size="lg"
                  className="gold-glow-hover w-full rounded-full"
                >
                  {isLoading ? "Validating..." : "Enter Portal"}
                </Button>
              </motion.div>

              <p className="pt-1 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                No account?{" "}
                <Link href="/signup" className="text-accent hover:text-white">
                  Register
                </Link>
              </p>
            </FieldGroup>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
