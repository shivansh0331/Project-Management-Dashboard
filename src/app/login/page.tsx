"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ShieldAlert, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true);
    // Standard mock user login (defaulting to ADMIN for direct form login)
    await login(data.email, "ADMIN");
    setSubmitting(false);
  };

  const handleQuickLogin = async (role: "ADMIN" | "USER") => {
    setSubmitting(true);
    const email = role === "ADMIN" ? "admin@envision.studio" : "operator@envision.studio";
    await login(email, role);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 select-none relative">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50 dark:opacity-100">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blob-1 filter blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blob-2 filter blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6.5 md:p-8 shadow-2xl relative z-10 glow-on-hover transition-all"
      >
        {/* Logo and Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 mb-8">
          <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Welcome back to Zenith Flow
            </h1>
            <p className="text-xs text-muted-foreground">
              Sign in to manage and accelerate your team workflows.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <Input
            label="Email Address"
            placeholder="e.g. john@envision.studio"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" variant="primary" className="w-full h-11 mt-2 text-xs font-bold" isLoading={submitting}>
            Sign In with Email
          </Button>
        </form>

        {/* Quick Demo Login Shortcuts */}
        <div className="mt-7 space-y-3 border-t border-border/80 pt-6">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block text-center">
            Assessment Quick Access Roles
          </span>
          <div className="grid grid-cols-2 gap-3.5">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => handleQuickLogin("ADMIN")}
              className="w-full flex-col h-20 gap-1.5 border border-primary/20 hover:border-primary/40 bg-primary/5 select-none"
            >
              <ShieldCheck className="h-4.5 w-4.5 text-primary" />
              <div className="flex flex-col text-center leading-none">
                <span className="text-[10px] font-bold">Admin Demo</span>
                <span className="text-[8px] text-muted-foreground mt-0.5">Full Workspace Control</span>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => handleQuickLogin("USER")}
              className="w-full flex-col h-20 gap-1.5 border border-border bg-background/50 hover:bg-secondary select-none"
            >
              <User className="h-4.5 w-4.5 text-muted-foreground" />
              <div className="flex flex-col text-center leading-none">
                <span className="text-[10px] font-bold">User Demo</span>
                <span className="text-[8px] text-muted-foreground mt-0.5">Kanban Member Only</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Signup Link */}
        <p className="text-center text-xs text-muted-foreground mt-6 leading-none">
          Don't have an account?{" "}
          <Link href="/signup" className="font-bold text-primary hover:underline">
            Sign up here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
