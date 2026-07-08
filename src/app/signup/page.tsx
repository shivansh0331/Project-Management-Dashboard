"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useAuth, UserRole } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "ADMIN"] as const, {
    message: "Role category is required",
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signup } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", role: "USER" },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setSubmitting(true);
    await signup(data.name, data.email, data.role);
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
        <div className="flex flex-col items-center justify-center text-center space-y-3 mb-7">
          <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Create your account
            </h1>
            <p className="text-xs text-muted-foreground">
              Sign up to setup your projects and start tracking.
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            error={errors.name?.message}
            {...register("name")}
          />
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground select-none leading-none">
              Account Category
            </label>
            <select
              {...register("role")}
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="USER">Standard User (Workspace Member)</option>
              <option value="ADMIN">Workspace Administrator (Full Access)</option>
            </select>
            {errors.role && (
              <p className="text-[10px] font-semibold text-destructive leading-none mt-0.5">
                {errors.role.message}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full h-11 mt-3 text-xs font-bold" isLoading={submitting}>
            Register Account
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-xs text-muted-foreground mt-6 leading-none">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
