"use client";

import { LogOut } from "lucide-react";

export default function LogoutButton({ className = "nav-logout" }: { className?: string }) {
  async function handleLogout() {
    try {
      await fetch("/api/users/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      Sign out <LogOut size={15} />
    </button>
  );
}
