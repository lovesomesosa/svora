"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  function getNavLinkClass(href: string) {
  const isActive = pathname === href;

  return `rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
    isActive
      ? "bg-neutral-800 text-white"
      : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
  }`;
}
  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-neutral-800">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    <Link
      href="/"
      className="rounded-lg px-3 py-2 text-lg font-semibold transition-all duration-200 hover:bg-neutral-800 hover:text-white"
    >
      Svora Manager
    </Link>

    <div className="flex items-center gap-4">
      {/* NAV — сохраняем место всегда */}
      <nav className="flex items-center gap-2">
        {user ? (
          <>
            <Link href="/dashboard" className={getNavLinkClass("/dashboard")}>
              Dashboard
            </Link>

            <Link href="/bookings" className={getNavLinkClass("/bookings")}>
              Bookings
            </Link>

            <Link href="/projects" className={getNavLinkClass("/projects")}>
              Projects
            </Link>
          </>
        ) : (
          // пустой блок, чтобы layout не прыгал
          <div className="h-[34px]" />
        )}
      </nav>

      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">{user.role}</span>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-neutral-700 px-3 py-1 text-sm transition hover:bg-neutral-800"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-lg px-3 py-2 text-sm text-neutral-300 transition-all duration-200 hover:bg-neutral-800 hover:text-white"
        >
          Login
        </Link>
      )}
    </div>
  </div>
</header>
  );
}
