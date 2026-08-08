"use client";

import React, { createContext, useContext, useState } from "react";
import { AdminUser, AdminRole, DEFAULT_ADMIN_USER } from "@/lib/admin/auth";
import { useRouter } from "next/navigation";

type AdminAuthContextType = {
  user: AdminUser | null;
  setRole: (role: AdminRole) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: DEFAULT_ADMIN_USER,
  setRole: () => {},
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    if (typeof window === "undefined") return DEFAULT_ADMIN_USER;
    try {
      const savedRole = localStorage.getItem("ascend_hq_active_role") as AdminRole | null;
      if (savedRole && ["owner", "admin", "editor", "support"].includes(savedRole)) {
        return { ...DEFAULT_ADMIN_USER, role: savedRole };
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_ADMIN_USER;
  });
  const router = useRouter();

  const handleSetRole = (role: AdminRole) => {
    localStorage.setItem("ascend_hq_active_role", role);
    setUser((prev) => (prev ? { ...prev, role } : null));
  };

  const handleLogout = () => {
    document.cookie = "ascend_hq_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("ascend_hq_active_role");
    setUser(null);
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        setRole: handleSetRole,
        logout: handleLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
