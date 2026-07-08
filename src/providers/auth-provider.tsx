"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export type UserRole = "ADMIN" | "USER";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: UserRole) => Promise<boolean>;
  signup: (name: string, email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("zenith_auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("zenith_auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Handle route guards
  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ["/login", "/signup"];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.replace("/login");
    } else if (user && isPublicRoute) {
      router.replace("/");
    }
  }, [user, pathname, isLoading, router]);

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock login validation
      const name = role === "ADMIN" ? "Admin Master" : "Standard Operator";
      const userData: AuthUser = { name, email, role };
      
      localStorage.setItem("zenith_auth_user", JSON.stringify(userData));
      setUser(userData);
      toast.success(`Logged in as ${name} (${role})`);
      router.push("/");
      return true;
    } catch (error) {
      toast.error("Login failed. Check console.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userData: AuthUser = { name, email, role };
      localStorage.setItem("zenith_auth_user", JSON.stringify(userData));
      setUser(userData);
      toast.success(`Account created! Welcome, ${name}.`);
      router.push("/");
      return true;
    } catch (error) {
      toast.error("Account creation failed.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("zenith_auth_user");
    setUser(null);
    toast.info("Logged out successfully.");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
