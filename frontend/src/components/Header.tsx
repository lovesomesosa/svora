"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-neutral-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold">
          Svora Manager
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4 text-sm text-neutral-300">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/bookings">Bookings</Link>
            <Link href="/projects">Projects</Link>
          </nav>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400">{user.role}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-neutral-300">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}