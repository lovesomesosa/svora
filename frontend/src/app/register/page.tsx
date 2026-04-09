"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/dist/client/link";

type RegisterResponse = {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "OWNER";
  createdAt: string;
  updatedAt: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);

    try {
      await apiRequest<RegisterResponse>("/api/auth/register", {
        method: "POST",
        body: {
          name,
          email,
          password,
        },
      });

      setSuccess("Аккаунт создан. Теперь можно войти.");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold">Регистрация</h1>
        <p className="text-sm text-neutral-400">
          Создай аккаунт для работы со студийными проектами.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none"
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none"
          required
        />

        <input
          type="password"
          placeholder="Подтверждение пароля"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none"
          required
        />

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {success ? <p className="text-sm text-green-400">{success}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white px-4 py-3 font-medium !text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Создаём..." : "Создать аккаунт"}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-neutral-400">
        Уже работаешь на студии?{" "}
        <Link
        href="/login"
        className="text-white underline underline-offset-4 hover:opacity-80"
        >
          Авторизоваться
          </Link>
      </div>
    </div>
  );
}
