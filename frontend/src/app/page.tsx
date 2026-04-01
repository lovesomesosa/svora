import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex min-h-[70vh] items-center">
      <div className="max-w-3xl space-y-6">
        <span className="inline-flex rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-sm text-neutral-300">
          Studio management platform
        </span>

        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          Управление студией, бронированиями и музыкальными проектами
        </h1>

        <p className="max-w-2xl text-lg text-neutral-400">
          Svora Manager помогает вести бронирования, проекты, треки, версии и
          комментарии в одном аккуратном интерфейсе.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-block rounded-xl bg-white px-5 py-3 font-medium !text-black transition hover:opacity-90"
          >
            Войти
          </Link>

          <Link
            href="/register"
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-3 font-medium text-white transition hover:bg-neutral-800"
          >
            Регистрация
          </Link>
        </div>
      </div>
    </section>
  );
}