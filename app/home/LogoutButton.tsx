"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const response = await fetch("/api/users/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <button onClick={handleLogout} className="nav-logout">
      Logout <LogOut size={15} />
    </button>
  );
}