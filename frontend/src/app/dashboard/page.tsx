import Protected from "@/components/Protected";
const cards = [
  {
    title: "Bookings",
    value: "12",
    description: "Активные и предстоящие бронирования",
  },
  {
    title: "Projects",
    value: "5",
    description: "Текущие музыкальные проекты",
  },
  {
    title: "Comments",
    value: "18",
    description: "Новые комментарии по трекам",
  },
];

export default function DashboardPage() {
  return (
    <Protected>
        <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-neutral-400">
          Базовый обзор бронирований, проектов и активности.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
          >
            <p className="text-sm text-neutral-400">{card.title}</p>
            <p className="mt-3 text-3xl font-semibold">{card.value}</p>
            <p className="mt-2 text-sm text-neutral-500">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Быстрые действия</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/bookings"
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
          >
            Перейти к бронированиям
          </a>
          <a
            href="/projects"
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
          >
            Перейти к проектам
          </a>
        </div>
      </div>
    </section>
    </Protected>
  );
}